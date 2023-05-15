const mariadb = require("mariadb/callback");
require("dotenv").config();
const Sentry = require("@sentry/node");

console.log("Initializing Database...");

console.log("Init DB...");
const dbCon = mariadb.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_CHAT,
  connectionLimit: 25,
});

dbCon.connect((err, conn) => {
  if (err) {
    Sentry.captureException(err);
    console.log("Connetion Failed! " + err);
  } else {
    console.log("connected! Connection id is: " + conn.threadId);
  }
});

module.exports = dbCon;
