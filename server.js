const express = require("express");
const compression = require("compression");
const next = require("next");
const session = require("express-session");
const bodyParser = require("body-parser");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const apiRoutes = require("./server/routes/apiRoutes.js");
const crons = require("./server/routes/crons.js");
const { connectionString } = require("./next.config");
const pgSession = require("connect-pg-simple")(session);
const { ensureAuthenticated } = require("./config/auth");
const fileUpload = require("express-fileupload");
const cluster = require("cluster");
const CPU_CORES = Number(process.env.CPU_COUNT);
const PORT = Number(process.env.SERVER_PORT);
const passport = require("passport");
require("./config/passport")(passport);
const Users = require("./models").Users;
const Logins = require("./models").Logins;
const IpBlocks = require("./models").IpBlocks;
const { sendSMS, apiLog } = require("./server/functions.js");
const helmet = require("helmet");

app
  .prepare()
  .then(async () => {
    console.log(dev);
    console.log(`IS DEV MODE ACTIVATED: ${process.env.DEV_ENV}`);
    const server = express();
    server.use(compression());
    server.use(helmet({ contentSecurityPolicy: false }));
    server.use(express.urlencoded({ extended: true }));
    server.use(bodyParser.json({ limit: "250mb" }));
    server.use(bodyParser.urlencoded({ extended: true, limit: "250mb" }));
    server.use(fileUpload());
    server.use(
      session({
        cookie: {
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          secure: !dev,
        },
        proxy: !dev,
        secret: "super special project tasks secret key",
        resave: false,
        saveUninitialized: true,
        store: new pgSession({ conString: connectionString }),
      })
    );
    server.use(passport.initialize());
    server.use(passport.session());
    server.set("trust proxy", true);
    server.use("/files", [ensureAuthenticated, express.static("files")]);
    server.use("/crons", crons);

    server.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With"
      );
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      next();
    });

    server.use("/api", apiRoutes);

    server.post("/login", (req, res, next) => {
      passport.authenticate("local", async (err, user) => {
        let ipNo = req.ip;
        if (ipNo.substring(0, 7) == "::ffff:") {
          ipNo = ipNo.substring(7);
        }
        if (err) {
          return next(err);
        } else if (!user) {
          const result = await Logins.findOne({
            where: { email: req.body.email },
            raw: true,
          });
          if (!result) {
            if (!process.env.SAFE_IP.split(",").includes(ipNo)) {
              await Logins.create({ email: req.body.email, count: 1 });
            }
            res.json({ success: false, message: "incorrectlogin" });
          } else {
            try {
              if (!process.env.SAFE_IP.split(",").includes(ipNo)) {
                await Logins.increment(
                  { count: 1 },
                  { where: { email: req.body.email }, raw: true }
                );
              }
              if (result.count + 1 > 2) {
                const ip = await IpBlocks.findOne({ where: { ip: req.ip } });
                if (ip) {
                  res.json({ success: false, message: "ipblock", ip: ipNo });
                } else {
                  if (!process.env.SAFE_IP.split(",").includes(ipNo)) {
                    await IpBlocks.create({ ip: ipNo });
                  } else {
                    res.json({ success: false, message: "incorrectlogin" });
                    return;
                  }
                  res.json({ success: false, message: "ipblock", ip: ipNo });
                }
              } else {
                res.json({ success: false, message: "incorrectlogin" });
              }
            } catch (err) {
              apiLog(
                req.ip,
                req.body,
                err,
                "warning",
                req.path,
                user.name || req.body.email
              );
              res.json({ success: false, msg: "incorrectlogin" });
            }
          }
        } else {
          const ip = await IpBlocks.findOne({ where: { ip: req.ip } });
          const isBlocked = await Logins.findOne({
            where: { email: req.body.email },
          });
          if (ip) {
            res.json({ success: false, msg: "ipblock" });
          } else if (isBlocked && isBlocked.count > 2) {
            if (process.env.SAFE_IP.split(",").includes(ipNo)) {
              isBlocked.update({ count: 0 });
              res.json({ success: false, msg: "incorrectlogin" });
            } else {
              res.json({ success: false, msg: "accountblocked" });
            }
          } else {
            await Logins.update(
              { count: 0 },
              { where: { email: req.body.email } }
            );
            if (!dev) {
              const authToken = Math.round(Math.random() * 899999 + 100000);
              const tempUser = await Users.update(
                { authToken: authToken },
                { where: { email: req.body.email } }
              );
              if (tempUser[0]) {
                const msg = `Sisteme giriş güvenlik kodunuz: ${authToken}`;
                sendSMS(user.phone, msg);
                res.json({ success: true });
              } else {
                res.json({ success: false, msg: "systemerror" });
              }
            } else {
              const user = await Users.findOne({
                where: { email: req.body.email },
              });
              if (user) {
                req.logIn(user, (err) => {
                  if (err) {
                    return next(err);
                  }
                  res.json({ success: true });
                });
              } else {
                res.json({ success: false, message: "incorrectlogin" });
              }
            }
          }
        }
      })(req, res, next);
    });

    server.post("/getBlockedIps", async (req, res) => {
      let ip = req.ip;
      if (ip.substring(0, 7) == "::ffff:") {
        ip = ip.substring(7);
      }
      const result = await IpBlocks.findOne({ where: { ip: ip } });
      if (result) {
        res.json({ success: false, ip: ip });
      } else {
        res.json({ success: true });
      }
    });

    server.post("/verifyToken", async (req, res, next) => {
      const user = await Users.findOne({
        where: { email: req.body.email, authToken: req.body.authToken },
      });
      if (user) {
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.json({ success: true });
        });
      } else {
        res.json({ success: false });
      }
    });

    server.get("/pwa/*", (req, res) => {
      return handle(req, res);
    });

    server.get("/manifest.json", (req, res) => {
      try {
        const company = process.env.PWA_NAME;
        const title = `${company} MRP`;
        const url = process.env.SERVER_IP;
        const folder = process.env.PWA_FOLDER;
        const theme = process.env.PWA_THEME_COLOR;
        const background = process.env.PWA_BACKGROUND_COLOR;
        const languages = ["en", "tr"];
        const language = languages.includes(req.query.language)
          ? req.query.language
          : "tr";
        const localizedContent = {
          name: { en: `${title}`, tr: `${title}` },
          short_name: { en: `${title}`, tr: `${title}` },
          description: {
            en: `${title} is an app that allows you to manage your workflow, customers, products, and sales.`,
            tr: `${title}, iş akışınızı, müşterilerinizi, ürünlerinizi ve satışlarınızı yönetmenizi sağlayan bir uygulamadır.`,
          },
          shortcuts: {
            1: {
              name: { en: "Home", tr: "Ana Sayfa" },
              url: { en: "/en", tr: "/" },
              description: {
                en: "View the home page.",
                tr: "Ana sayfayı görüntüle.",
              },
            },
            2: {
              name: { en: "Mobile View", tr: "Mobil Görünüm" },
              url: { en: "/en", tr: "/" },
              description: {
                en: "Mobile View",
                tr: "Mobil Görünüm.",
              },
            },
          },
          screenshots: {
            1: { label: { en: "Desktop View", tr: "Masaüstü Görünümü" } },
            2: { label: { en: "Mobile View", tr: "Mobil Görünüm" } },
          },
        };
        const manifest = {
          name: localizedContent.name[language],
          short_name: localizedContent.short_name[language],
          description: localizedContent.description[language],
          categories: ["business", "productivity"],
          theme_color: theme,
          background_color: background,
          start_url: "/",
          display: "standalone",
          orientation: "portrait",
          launch_handler: { client_mode: ["focus-existing", "auto"] },
          scope: url,
          url_handlers: [{ origin: url }],
          shortcuts: [
            {
              name: localizedContent.shortcuts[1].name[language],
              url: localizedContent.shortcuts[1].url[language],
              description: localizedContent.shortcuts[1].description[language],
              icons: [{ src: `/pwa/${folder}/icons/96.png`, sizes: "96x96" }],
            },
            {
              name: localizedContent.shortcuts[2].name[language],
              url: localizedContent.shortcuts[2].url[language],
              description: localizedContent.shortcuts[2].description[language],
              icons: [{ src: `/pwa/${folder}/icons/96.png`, sizes: "96x96" }],
            },
          ],
          screenshots: [
            {
              src: `/pwa/${folder}/screenshots/Screenshot1.png`,
              sizes: "2560x1440",
              type: "image/png",
              form_factor: "wide",
              label: localizedContent.screenshots[1].label[language],
            },
            {
              src: `/pwa/${folder}/screenshots/Screenshot2.png`,
              sizes: "1290x2796",
              type: "image/png",
              form_factor: "narrow",
              label: localizedContent.screenshots[2].label[language],
            },
          ],
          icons: [
            {
              src: `/pwa/${folder}/icons/48.png`,
              sizes: "48x48",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `/pwa/${folder}/icons/48_maskable.png`,
              sizes: "48x48",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: `/pwa/${folder}/icons/72.png`,
              sizes: "72x72",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `/pwa/${folder}/icons/72_maskable.png`,
              sizes: "72x72",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: `/pwa/${folder}/icons/96.png`,
              sizes: "96x96",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `/pwa/${folder}/icons/96_maskable.png`,
              sizes: "96x96",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: `/pwa/${folder}/icons/192.png`,
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `/pwa/${folder}/icons/192_maskable.png`,
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: `/pwa/${folder}/icons/384.png`,
              sizes: "384x384",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `/pwa/${folder}/icons/384_maskable.png`,
              sizes: "384x384",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: `/pwa/${folder}/icons/512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `/pwa/${folder}/icons/512_maskable.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        };
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(manifest);
      } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    server.get("/auth", (req, res, next) => {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
      });
      return handle(req, res);
    });

    server.use("/api", apiRoutes);

    server.get("/images/*", (req, res) => {
      return handle(req, res);
    });

    server.get("/offer", (req, res) => {
      return handle(req, res);
    });

    server.get("/css/*", (req, res) => {
      return handle(req, res);
    });

    server.get("/files/logos", (req, res) => {
      return handle(req, res);
    });

    server.get("/customerform", (req, res) => {
      return handle(req, res);
    });

    server.get("/vehiclestatus", (req, res) => {
      return handle(req, res);
    });

    server.get("/_next/*", (req, res) => {
      return handle(req, res);
    });

    server.get("/loaderio-1cd5efa2591d128aff5c57ed5cc41f19.txt", (req, res) => {
      return handle(req, res);
    });

    server.all("*", ensureAuthenticated, (req, res) => {
      return handle(req, res);
    });

    if (CPU_CORES > 1) {
      if (cluster.isMaster) {
        for (let i = 0; i < CPU_CORES; i++) {
          cluster.fork();
        }
        cluster.on("exit", (worker) => {
          console.log("Worker", worker.id, " has exitted.");
          cluster.fork(); // RE FORK IN CASE OF FAILURE
        });
      } else {
        server.listen(PORT, (err) => {
          if (err) {
            console.log(err);
          }
          console.log(
            `Express server listening on port ${PORT} and worker ${process.pid} at at ${process.env.SERVER_IP}`
          );
        });
      }
    } else {
      server.listen(PORT, (err) => {
        if (err) {
          console.log(err);
        }
        console.log(
          `Express server listening on port ${PORT} with the single worker ${process.pid} at ${process.env.SERVER_IP}`
        );
      });
    }
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
