const { db } = require("./db");
const fs = require("fs");

async function checkOrders() {
    let output = "";
    try {
        output += "Orders table structure:\n";
        const [structure] = await db.query("DESCRIBE orders");
        output += JSON.stringify(structure, null, 2) + "\n\n";

        fs.writeFileSync("orders-check-output.txt", output);
        console.log("Orders check complete. Output written to orders-check-output.txt");
        process.exit(0);
    } catch (err) {
        output += "Error: " + err.message + "\n" + err.stack;
        fs.writeFileSync("orders-check-output.txt", output);
        console.error("Error:", err);
        process.exit(1);
    }
}

checkOrders();
