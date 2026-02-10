const mysql = require("mysql2");
require("dotenv").config();

// MySQL Connection
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "sanjay",
  database: process.env.MYSQL_DB || "autotrade_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promise-based pool
const db = mysqlPool.promise();

// Test connection (optional but recommended)
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("MySQL connected");
  } catch (err) {
    console.error("MySQL connection error:", err.message);
  }
})();

module.exports = { db };
