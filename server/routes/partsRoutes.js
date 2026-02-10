const express = require("express");
const router = express.Router();
const { db } = require("../db");

// GET ALL PARTS
router.get("/", async (req, res) => {
    try {
        const sql = `
            SELECT p.*, sc.centername, sc.address 
            FROM parts p
            LEFT JOIN servicecenters sc ON p.centerid = sc.centerid
        `;
        const [parts] = await db.query(sql);
        res.json(parts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch parts" });
    }
});

// ADD PART (Service Center)
router.post("/add", async (req, res) => {
    const { partname, partnumber, partprice, centerid } = req.body;
    try {
        await db.query(
            "INSERT INTO parts (partname, partnumber, partprice, centerid) VALUES (?, ?, ?, ?)",
            [partname, partnumber, partprice, centerid]
        );
        res.status(201).json({ message: "Part added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add part" });
    }
});

// BUY PART
router.post("/buy", async (req, res) => {
    const { buyer_userid, partid, centerid, paymentmode } = req.body;

    try {
        await db.query("START TRANSACTION");

        // 1. Process Payment
        const [payResult] = await db.query(
            "INSERT INTO payment (paymentmode, paymentstatus) VALUES (?, 'Pending')",
            [paymentmode]
        );
        const paymentId = payResult.insertId;

        // 2. Create Order
        await db.query(
            "INSERT INTO part_orders (partid, buyer_userid, centerid, orderdate, paymentid) VALUES (?, ?, ?, CURDATE(), ?)",
            [partid, buyer_userid, centerid, paymentId]
        );

        await db.query("COMMIT");
        res.json({ message: "Part ordered successfully" });

    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Purchase failed" });
    }
});

// GET MY PART ORDERS (Buyer & Service Center)
router.get("/my-orders/:userId", async (req, res) => {
    const { userId } = req.params;
    const { role } = req.query;

    let sql = "";
    let params = [userId];

    if (role === 'service_center') {
        sql = `
            SELECT po.*, p.partname, p.partnumber, p.partprice, u.username as buyername, py.paymentstatus
            FROM part_orders po
            JOIN parts p ON po.partid = p.partid
            JOIN user u ON po.buyer_userid = u.userid
            JOIN payment py ON po.paymentid = py.paymentid
            JOIN servicecenters sc ON po.centerid = sc.centerid
            WHERE sc.userid = ?
        `;
    } else {
        sql = `
            SELECT po.*, p.partname, p.partnumber, p.partprice, sc.centername, py.paymentstatus
            FROM part_orders po
            JOIN parts p ON po.partid = p.partid
            JOIN servicecenters sc ON po.centerid = sc.centerid
            JOIN payment py ON po.paymentid = py.paymentid
            WHERE po.buyer_userid = ?
        `;
    }

    try {
        const [orders] = await db.query(sql, params);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

module.exports = router;

