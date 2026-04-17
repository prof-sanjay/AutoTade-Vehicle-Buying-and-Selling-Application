const express = require("express");
const router = express.Router();
const { db } = require("../db");

/**
 * NOTIFY SELLER
 * Creates:
 * 1. payment record (Pending)
 * 2. order record (status = 'Notified')
 */
router.post("/notify", async (req, res) => {
    const { itemId, buyerId, sellerId, amount } = req.body;

    // 🔴 Hard validation (THIS fixes your error)
    if (!itemId || !buyerId || !sellerId) {
        return res.status(400).json({
            error: "Missing required IDs",
            received: { itemId, buyerId, sellerId }
        });
    }

    try {
        await db.query("START TRANSACTION");

        // 1️⃣ Create payment
        const [paymentResult] = await db.query(
            "INSERT INTO payment (paymentmode, paymentstatus, amount) VALUES (?, ?, ?)",
            ["Cash", "Pending", amount || 0]
        );

        const paymentId = paymentResult.insertId;

        // 2️⃣ Create order
        const [orderResult] = await db.query(
            `INSERT INTO orders 
             (vehicleid, buyer_userid, seller_userid, orderdate, ordertime, paymentid, status)
             VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?)`,
            [itemId, buyerId, sellerId, paymentId, "Notified"]
        );

        await db.query("COMMIT");

        res.json({
            success: true,
            orderId: orderResult.insertId,
            message: "Seller notified & order created"
        });

    } catch (err) {
        await db.query("ROLLBACK");
        console.error("Notify Seller Error:", err);
        res.status(500).json({ error: "Failed to process notification" });
    }
});

/**
 * GET MY ORDERS
 */
router.get("/my-orders/:userId", async (req, res) => {
    const { userId } = req.params;
    const { role } = req.query;

    try {
        // Purchases Query (for when I am the buyer)
        // Join with 'user' table for seller details
        const purchasesSql = `
            SELECT o.*, o.status as order_status, v.model, v.price, v.vehicleregistration, 
                   s.name as sellername, s.phonenumber as sellerphone
            FROM orders o
            LEFT JOIN vehicles v ON o.vehicleid = v.vehicleid
            LEFT JOIN user s ON o.seller_userid = s.userid
            WHERE o.buyer_userid = ?
            ORDER BY o.orderdate DESC, o.ordertime DESC
        `;

        // Sales Query (for when I am the seller)
        // Join with 'user' table for buyer details
        const salesSql = `
            SELECT o.*, o.status as order_status, v.model, v.price, v.vehicleregistration, 
                   b.name as buyername, b.phonenumber as buyerphone
            FROM orders o
            LEFT JOIN vehicles v ON o.vehicleid = v.vehicleid
            LEFT JOIN user b ON o.buyer_userid = b.userid
            WHERE o.seller_userid = ?
            ORDER BY o.orderdate DESC, o.ordertime DESC
        `;

        let result = {};

        if (role === "buyer") {
            const [orders] = await db.query(purchasesSql, [userId]);
            result = orders; 
        } else if (role === "seller") {
            const [orders] = await db.query(salesSql, [userId]);
            result = orders; 
        } else {
            // Unified User: Return both
            const [purchases] = await db.query(purchasesSql, [userId]);
            const [sales] = await db.query(salesSql, [userId]);
            result = { purchases, sales, isUnified: true };
        }

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

/**
 * VERIFY PAYMENT
 */
router.put("/verify-payment", async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ error: "Missing Order ID" });

    try {
        await db.query("START TRANSACTION");

        // 1. Get Payment ID
        const [orders] = await db.query("SELECT paymentid FROM orders WHERE orderid = ?", [orderId]);
        if (orders.length === 0) {
            await db.query("ROLLBACK");
            return res.status(404).json({ error: "Order not found" });
        }
        const paymentId = orders[0].paymentid;

        // 2. Update Payment Status
        await db.query("UPDATE payment SET paymentstatus = 'Completed' WHERE paymentid = ?", [paymentId]);

        // 3. Update Order Status
        await db.query("UPDATE orders SET status = 'Completed' WHERE orderid = ?", [orderId]);

        await db.query("COMMIT");

        res.json({ message: "Payment verified successfully" });

    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});

module.exports = router;
