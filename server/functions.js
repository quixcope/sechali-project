require("dotenv").config({ path: "../.env.local" });
require("dotenv").config({ path: "./.env.local" });
const http = require("http");
const axios = require("axios");

const sendSMS = async (sms, msg) => {
  if (process.env.DEV_ENV == "NO") {
    try {
      let smsNumber = sms.replace("+", "");
      const options = {
        method: "POST",
        hostname: `${process.env.SMS_HOSTNAME}`,
        path: "/SendSmsMany.aspx",
        headers: {
          "Content-Type": "text/xml",
        },
        maxRedirects: 20,
      };
      const request = http.request(options, (res) => {
        var chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk);
        });
        res.on("end", () => {
          Buffer.concat(chunks);
        });
        res.on("error", (error) => {
          console.error(error);
        });
      });
      const postData = `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=""\r\n\r\n<?xml version="1.0" encoding="UTF-8"?><MainmsgBody><UserName>${process.env.SMS_USERNAME}</UserName><PassWord>${process.env.SMS_PASSWORD}</PassWord><Type>5</Type><Developer></Developer><Version>xVer.2.0</Version><Originator>${process.env.SMS_SUBJECT}</Originator><Messages><Message><Mesgbody><![CDATA[${msg}]]></Mesgbody><Numbers>${smsNumber}</Numbers><SDate></SDate><EDate></EDate></Message></Messages></MainmsgBody>\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--`;
      request.setHeader(
        "content-type",
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
      );
      request.write(postData);
      request.end();
    } catch (err) {
      return err;
    }
  } else {
    console.table([sms, msg]);
  }
};

const apiLog = async (ip, received, sentData, type, path, userName) => {
  if (process.env.NODE_ENV !== "production") {
    if (type === "error") {
      console.error(sentData);
    } else if (type === "warning") {
      console.warn(sentData);
    } else {
      console.log(sentData);
    }
  } else {
    type = typeof type === "undefined" ? "success" : type;
    const data = {
      apiKey: process.env.LOG_KEY,
      app: "project-logistic",
      msg: sentData,
      type: type,
      path: path,
      userName: userName,
      ip: ip,
      received: received,
    };
    await axios.post(`${process.env.LOG_URL}/globalLog`, data);
  }
};

const makeid = (size) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < (size || 8); i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const convertCurrency = (value, text) => {
  let currency =
    value === "usd"
      ? text
        ? "DOLAR"
        : "$"
      : value === "eur"
        ? text
          ? "EURO"
          : "€"
        : value === "gbp"
          ? text
            ? "STERLIN"
            : "£"
          : value === "try"
            ? text
              ? "TL"
              : "₺"
            : "";
  return currency;
};

module.exports = { sendSMS, apiLog, makeid, convertCurrency };
