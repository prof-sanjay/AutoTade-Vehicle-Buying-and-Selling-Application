const mysql = require("mysql2/promise");
require("dotenv").config();

async function alterVehicleTable() {
    const config = {
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "sanjay",
        database: "autotrade_db"
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log("Connected to MySQL Server");

        // Check which columns exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'autotrade_db' 
            AND TABLE_NAME = 'vehicle'
        `);

        const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
        console.log("Existing columns:", existingColumns);

        // Add missing columns one by one
        const alterations = [];

        if (!existingColumns.includes('vehicleregistration')) {
            alterations.push("ADD COLUMN vehicleregistration VARCHAR(50)");
        }
        if (!existingColumns.includes('dateofmanufacture')) {
            alterations.push("ADD COLUMN dateofmanufacture DATE");
        }
        if (!existingColumns.includes('kmdriven')) {
            alterations.push("ADD COLUMN kmdriven INT");
        }
        if (!existingColumns.includes('engine')) {
            alterations.push("ADD COLUMN engine VARCHAR(50)");
        }
        if (!existingColumns.includes('fueltype')) {
            alterations.push("ADD COLUMN fueltype VARCHAR(30)");
        }
        if (!existingColumns.includes('transmission')) {
            alterations.push("ADD COLUMN transmission VARCHAR(30)");
        }

        if (alterations.length > 0) {
            const sql = `ALTER TABLE vehicle ${alterations.join(', ')}`;
            console.log("Executing:", sql);
            await connection.query(sql);
            console.log("Vehicle table updated successfully!");
        } else {
            console.log("All columns already exist!");
        }

        await connection.end();
    } catch (err) {
        console.error("Failed to alter table:", err);
    }
}

alterVehicleTable();
