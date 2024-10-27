const path = require("path");
const jsonPath = path.join(__dirname, "..", ".env.local");
require("dotenv").config({ path: jsonPath });
const data = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    dialectOptions: { useUTC: true },
    pool: { max: 20, min: 0, acquire: "180000", idle: "10000" },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    dialectOptions: { useUTC: true },
    pool: { max: 20, min: 0, acquire: "180000", idle: "10000" },
  },
};

module.exports = data;
