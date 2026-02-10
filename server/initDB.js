const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function initDB() {
    const config = {
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "sanjay",
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log("Connected to MySQL Server");

        const sqlPath = path.join(__dirname, "Database", "DB.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("Executing SQL script...");
        await connection.query(sql);

        console.log("Database initialized successfully!");
        await connection.end();
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
}

initDB();
