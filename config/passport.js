const LocalStrategy = require("passport-local").Strategy;
const User = require("../models").Users;
const bcrypt = require("bcrypt");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            where: { email: email },
          });
          if (!user) {
            return done(null, false, { message: "usernotfound" });
          }
          if (user.active === false) {
            return done(null, false, {
              message: "notauthorized",
            });
          }
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "wrongpassword",
              });
            }
          });
        } catch (err) {
          console.log(err);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id: id } });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
