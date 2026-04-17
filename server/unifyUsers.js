const { db } = require("./db");

async function unifyUsers() {
    try {
        console.log("Unifying Users...");

        // 1. Add columns to USER table
        const columnsToAdd = [
            "ADD COLUMN email VARCHAR(255)",
            "ADD COLUMN phonenumber VARCHAR(20)",
            "ADD COLUMN address TEXT",
            "ADD COLUMN locationid INT",
            "ADD COLUMN name VARCHAR(255)" 
        ];

        for (const col of columnsToAdd) {
            try {
                await db.query(`ALTER TABLE user ${col}`);
                console.log(`Executed: ALTER TABLE user ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${col}`);
                } else {
                    console.error(`Error adding column: ${col}`, e.message);
                }
            }
        }

        // 2. Update Role ENUM to include just 'user', 'service_center' (and maybe keep old ones for safety or migrate)
        // We will just use 'user' for new buy/sell users.
        try {
            await db.query("ALTER TABLE user MODIFY COLUMN role ENUM('user','buyer','seller','service_center','admin') DEFAULT 'user'");
            console.log("Updated Role Enum to include 'user'");
        } catch (e) {
            console.error("Error updating role enum", e.message);
        }

        console.log("User table updated successfully.");
        process.exit();

    } catch (err) {
        console.error("Migration Failed:", err);
        process.exit(1);
    }
}

unifyUsers();
