const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrateToUnifiedUser() {
    const config = {
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "sanjay",
        database: "autotrade_db"
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log("Connected to MySQL Server");

        console.log("\n=== Starting Migration to Unified User Model ===\n");

        // Step 1: Update user table role enum
        console.log("1. Updating user table roles...");
        await connection.query(`
            ALTER TABLE user 
            MODIFY COLUMN role ENUM('user','service_center','admin') DEFAULT 'user'
        `);
        console.log("✓ User roles updated");

        // Step 2: Rename columns in vehicle table
        console.log("\n2. Updating vehicle table...");

        // Check if sellerid exists
        const [vehicleCols] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'autotrade_db' 
            AND TABLE_NAME = 'vehicle'
        `);
        const vehicleColumns = vehicleCols.map(col => col.COLUMN_NAME);

        if (vehicleColumns.includes('sellerid')) {
            // Drop foreign key first
            await connection.query(`
                ALTER TABLE vehicle 
                DROP FOREIGN KEY vehicle_ibfk_1
            `);
            console.log("  - Dropped old foreign key");

            // Rename column
            await connection.query(`
                ALTER TABLE vehicle 
                CHANGE COLUMN sellerid seller_userid INT
            `);
            console.log("  - Renamed sellerid to seller_userid");

            // Add foreign key back
            await connection.query(`
                ALTER TABLE vehicle 
                ADD FOREIGN KEY (seller_userid) REFERENCES user(userid)
            `);
            console.log("  - Added new foreign key");
        } else if (vehicleColumns.includes('seller_userid')) {
            console.log("  - seller_userid already exists");
        }

        // Step 3: Update orders table
        console.log("\n3. Updating orders table...");

        const [ordersCols] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'autotrade_db' 
            AND TABLE_NAME = 'orders'
        `);
        const ordersColumns = ordersCols.map(col => col.COLUMN_NAME);

        if (ordersColumns.includes('buyerid') || ordersColumns.includes('sellerid')) {
            // Drop foreign keys
            const [fks] = await connection.query(`
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'autotrade_db' 
                AND TABLE_NAME = 'orders'
                AND REFERENCED_TABLE_NAME = 'user'
            `);

            for (const fk of fks) {
                await connection.query(`
                    ALTER TABLE orders 
                    DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
                `);
                console.log(`  - Dropped foreign key: ${fk.CONSTRAINT_NAME}`);
            }

            // Rename columns
            if (ordersColumns.includes('buyerid')) {
                await connection.query(`
                    ALTER TABLE orders 
                    CHANGE COLUMN buyerid buyer_userid INT
                `);
                console.log("  - Renamed buyerid to buyer_userid");
            }

            if (ordersColumns.includes('sellerid')) {
                await connection.query(`
                    ALTER TABLE orders 
                    CHANGE COLUMN sellerid seller_userid INT
                `);
                console.log("  - Renamed sellerid to seller_userid");
            }

            // Add foreign keys back
            await connection.query(`
                ALTER TABLE orders 
                ADD FOREIGN KEY (buyer_userid) REFERENCES user(userid),
                ADD FOREIGN KEY (seller_userid) REFERENCES user(userid)
            `);
            console.log("  - Added new foreign keys");
        } else {
            console.log("  - buyer_userid and seller_userid already exist");
        }

        // Step 4: Update part_orders table
        console.log("\n4. Updating part_orders table...");

        const [partOrdersCols] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'autotrade_db' 
            AND TABLE_NAME = 'part_orders'
        `);
        const partOrdersColumns = partOrdersCols.map(col => col.COLUMN_NAME);

        if (partOrdersColumns.includes('buyerid')) {
            // Drop foreign key
            const [fks] = await connection.query(`
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'autotrade_db' 
                AND TABLE_NAME = 'part_orders'
                AND REFERENCED_TABLE_NAME = 'user'
            `);

            for (const fk of fks) {
                await connection.query(`
                    ALTER TABLE part_orders 
                    DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}
                `);
                console.log(`  - Dropped foreign key: ${fk.CONSTRAINT_NAME}`);
            }

            // Rename column
            await connection.query(`
                ALTER TABLE part_orders 
                CHANGE COLUMN buyerid buyer_userid INT
            `);
            console.log("  - Renamed buyerid to buyer_userid");

            // Add foreign key back
            await connection.query(`
                ALTER TABLE part_orders 
                ADD FOREIGN KEY (buyer_userid) REFERENCES user(userid)
            `);
            console.log("  - Added new foreign key");
        } else {
            console.log("  - buyer_userid already exists");
        }

        console.log("\n=== Migration Completed Successfully! ===\n");
        await connection.end();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrateToUnifiedUser();
