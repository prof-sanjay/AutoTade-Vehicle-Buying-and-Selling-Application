const { db } = require("./db");

async function updateSchema() {
    try {
        console.log("Updating Schema...");

        // 1. Update User Role ENUM (Robust Migration)
        // Step A: Allow both old and new values
        try {
            await db.query("ALTER TABLE user MODIFY COLUMN role ENUM('buyer','seller','servicecenter','service_center') NOT NULL");
        } catch (e) {
            // If it fails, maybe it's already done or different. Try direct target.
            console.log("Intermediate ALTER failed, trying direct...", e.message);
        }

        // Step B: Migrate data
        await db.query("UPDATE user SET role = 'service_center' WHERE role = 'servicecenter'");

        // Step C: Finalize ENUM
        await db.query("ALTER TABLE user MODIFY COLUMN role ENUM('buyer','seller','service_center') NOT NULL");
        console.log("Updated User Role ENUM");

        // 2. Add UserID to ServiceCenters
        // Check if column exists first to avoid error? Or just try/catch specific errors.
        // Simple approach: Add if not exists (MySQL syntax for ADD COLUMN IF NOT EXISTS is version dependent, 
        // usually easier to just run and catch duplicate column error or check information_schema)
        // For this script, I'll assume it doesn't exist yet as I checked the file.
        try {
            await db.query("ALTER TABLE servicecenters ADD COLUMN userid INT");
            await db.query("ALTER TABLE servicecenters ADD CONSTRAINT fk_sc_user FOREIGN KEY (userid) REFERENCES user(userid)");
            console.log("Added UserID to ServiceCenters");
        } catch (e) {
            console.log("UserID in ServiceCenters might already exist:", e.message);
        }

        // 3. Add CenterID to Parts
        try {
            await db.query("ALTER TABLE parts ADD COLUMN centerid INT");
            await db.query("ALTER TABLE parts ADD CONSTRAINT fk_parts_center FOREIGN KEY (centerid) REFERENCES servicecenters(centerid)");
            console.log("Added CenterID to Parts");
        } catch (e) {
            console.log("CenterID in Parts might already exist:", e.message);
        }

        // 4. Create Part Orders Table
        const createPartOrders = `
            CREATE TABLE IF NOT EXISTS part_orders (
                orderid INT NOT NULL AUTO_INCREMENT,
                partid INT,
                buyerid INT,
                centerid INT,
                orderdate DATE,
                paymentid INT,
                PRIMARY KEY (orderid),
                FOREIGN KEY (partid) REFERENCES parts(partid),
                FOREIGN KEY (buyerid) REFERENCES user(userid), -- Buyer can be a user
                FOREIGN KEY (centerid) REFERENCES servicecenters(centerid),
                FOREIGN KEY (paymentid) REFERENCES payment(paymentid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await db.query(createPartOrders);
        console.log("Created part_orders table");

        console.log("Schema Update Complete");
        process.exit();
    } catch (err) {
        console.error("Schema Update Failed:", err);
        process.exit(1);
    }
}

updateSchema();
