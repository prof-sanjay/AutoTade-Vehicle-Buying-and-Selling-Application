const { db } = require("./db");
const fs = require("fs");

async function checkDB() {
    let output = "";
    try {
        output += "Checking database tables...\n\n";

        // Show all tables
        const [tables] = await db.query("SHOW TABLES");
        output += "Tables in autotrade_db:\n";
        output += JSON.stringify(tables, null, 2) + "\n\n";

        // Check if vehicles table exists
        const [vehicleCheck] = await db.query("SHOW TABLES LIKE 'vehicles'");
        if (vehicleCheck.length > 0) {
            output += "Vehicles table structure:\n";
            const [structure] = await db.query("DESCRIBE vehicles");
            output += JSON.stringify(structure, null, 2) + "\n\n";

            // Check sample data
            const [sampleVehicle] = await db.query("SELECT * FROM vehicles LIMIT 1");
            output += "Sample vehicle data:\n";
            output += JSON.stringify(sampleVehicle, null, 2) + "\n\n";
        } else {
            output += "Vehicles table does not exist!\n\n";
        }

        // Check user table
        const [userCheck] = await db.query("SHOW TABLES LIKE 'user'");
        if (userCheck.length > 0) {
            output += "User table structure:\n";
            const [structure] = await db.query("DESCRIBE user");
            output += JSON.stringify(structure, null, 2) + "\n\n";

            // Check sample user
            const [sampleUser] = await db.query("SELECT userid, username, role, name, email, phonenumber FROM user LIMIT 1");
            output += "Sample user data:\n";
            output += JSON.stringify(sampleUser, null, 2) + "\n";
        } else {
            output += "User table does not exist!\n";
        }

        fs.writeFileSync("db-check-output.txt", output);
        console.log("Database check complete. Output written to db-check-output.txt");
        process.exit(0);
    } catch (err) {
        output += "Error: " + err.message + "\n" + err.stack;
        fs.writeFileSync("db-check-output.txt", output);
        console.error("Error:", err);
        process.exit(1);
    }
}

checkDB();
