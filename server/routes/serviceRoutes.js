const express = require("express");
const router = express.Router();
const { db } = require("../db");

// GET SERVICE CENTERS
router.get("/centers", async (req, res) => {
    try {
        const [centers] = await db.query("SELECT * FROM servicecenters");
        res.json(centers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch service centers" });
    }
});

// GET SERVICE TYPES
router.get("/types", async (req, res) => {
    try {
        const [types] = await db.query("SELECT * FROM servicetypes");
        res.json(types);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch service types" });
    }
});

// BOOK SERVICE
router.post("/book", async (req, res) => {
    const { centerid, vehicleid, servicetypeid, servicedate, servicetime, paymentmode } = req.body;

    try {
        await db.query("START TRANSACTION");

        // 1. Create Payment (Assuming paid upfront or booking fee, here marking as Pending/Completed similarly)
        const [payResult] = await db.query(
            "INSERT INTO payment (paymentmode, paymentstatus) VALUES (?, 'Pending')",
            [paymentmode]
        );
        const paymentId = payResult.insertId;

        // 2. Create Service Record
        const sql = `INSERT INTO service 
            (centerid, vehicleid, servicetypeid, servicedate, servicetime, paymentid) 
            VALUES (?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [centerid, vehicleid, servicetypeid, servicedate, servicetime, paymentId]);

        await db.query("COMMIT");

        res.status(201).json({ message: "Service booked successfully", serviceId: result.insertId });

    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Booking failed" });
    }
});

// GET BOOKINGS (Buyer & Service Center)
router.get("/bookings/:userId", async (req, res) => {
    const { userId } = req.params;
    const { role } = req.query;

    let sql = "";
    let params = [userId];

    if (role === 'service_center') {
        sql = `
            SELECT s.*, st.servicename, st.baseprice, u.username as customer_name, v.model, v.vehicleregistration, p.paymentstatus
            FROM service s
            JOIN servicetypes st ON s.servicetypeid = st.servicetypeid
            JOIN vehicle v ON s.vehicleid = v.vehicleid
            JOIN user u ON v.seller_userid = u.userid
            JOIN payment p ON s.paymentid = p.paymentid
            JOIN servicecenters sc ON s.centerid = sc.centerid
            WHERE sc.userid = ?
            ORDER BY s.servicedate DESC
        `;
    } else { 
        // Only show services for vehicles *this user* bought? 
        // Or if we assume the user passed in 'bookings/:userId' is the one who booked.
        // But we don't store 'userid' in service.
        // We can filter by vehicles that belong to this user?
        // Query: Find all services where vehicleid is in (Select vehicleid from orders where buyerid = ?)
        sql = `
            SELECT s.*, st.servicename, st.baseprice, sc.centername, sc.address, p.paymentstatus
            FROM service s
            JOIN servicetypes st ON s.servicetypeid = st.servicetypeid
            JOIN servicecenters sc ON s.centerid = sc.centerid
            JOIN payment p ON s.paymentid = p.paymentid
            WHERE s.vehicleid IN (SELECT vehicleid FROM orders WHERE buyer_userid = ?)
            ORDER BY s.servicedate DESC
        `;
    }

    try {
        const [bookings] = await db.query(sql, params);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// VERIFY SERVICE PAYMENT/COMPLETION
router.put("/verify-booking", async (req, res) => {
    const { serviceId } = req.body;
    try {
        const [rows] = await db.query("SELECT paymentid FROM service WHERE serviceid = ?", [serviceId]);
        if (rows.length === 0) return res.status(404).json({ error: "Service not found" });

        const paymentId = rows[0].paymentid;
        await db.query("UPDATE payment SET paymentstatus = 'Completed' WHERE paymentid = ?", [paymentId]);

        res.json({ message: "Service verified successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification failed" });
    }
});

module.exports = router;
