const express = require("express");
const router = express.Router();
const { db } = require("../db");
const { Feedback } = require("../models");


const isAdmin = (req, res, next) => {


            next();
};


router.get("/stats", isAdmin, async (req, res) => {
    try {
        const [[{ user_count }]] = await db.query("SELECT COUNT(*) as user_count FROM user");
        const [[{ vehicle_count }]] = await db.query("SELECT COUNT(*) as vehicle_count FROM vehicles");
        const [[{ service_count }]] = await db.query("SELECT COUNT(*) as service_count FROM services");
        const [[{ order_count }]] = await db.query("SELECT COUNT(*) as order_count FROM part_orders");

        res.json({
            users: user_count,
            vehicles: vehicle_count,
            services: service_count,
            orders: order_count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch admin stats" });
    }
});


router.get("/users", isAdmin, async (req, res) => {
    try {
        const [users] = await db.query("SELECT userid, username, role, email, phonenumber, address FROM user");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});


router.get("/vehicles", isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT v.*, u.username as seller_name
            FROM vehicles v
            LEFT JOIN user u ON v.seller_userid = u.userid
            ORDER BY v.created_at DESC
        `;
        const [vehicles] = await db.query(sql);
        res.json(vehicles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
});


router.get("/orders", isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT po.*, p.partname, u.username as buyer_name, sc.name as center_name
            FROM part_orders po
            JOIN parts p ON po.partid = p.partid
            JOIN user u ON po.buyer_userid = u.userid
            JOIN user sc ON po.centerid = sc.userid
            ORDER BY po.orderdate DESC
        `;
        const [orders] = await db.query(sql);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all part orders" });
    }
});


router.put("/users/:id/role", isAdmin, async (req, res) => {
    const { role } = req.body;
    try {
        await db.query("UPDATE user SET role = ? WHERE userid = ?", [role, req.params.id]);
        res.json({ message: "User role updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update role" });
    }
});


router.delete("/users/:id", isAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM user WHERE userid = ?", [req.params.id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});


router.put("/vehicles/:id/feature", isAdmin, async (req, res) => {
    const { featured } = req.body;
    try {
        await db.query("UPDATE vehicles SET featured = ? WHERE vehicleid = ?", [featured ? 1 : 0, req.params.id]);
        res.json({ message: "Vehicle strictly featured updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update featured status" });
    }
});


router.get(["/feedback/list", "/"], (req, res) => {

        Feedback.find().sort({ createdAt: -1 })
        .then(feedbacks => res.json(feedbacks))
        .catch(err => res.status(500).json({ error: "Failed to fetch feedbacks" }));
});


router.post(["/feedback", "/"], (req, res) => {
  const { userid, username, feedback } = req.body;
  if (!userid || !username || !feedback) return res.status(400).json({ error: 'All fields are required' });
  new Feedback({ userid, username, feedback }).save()
    .then(() => res.status(201).json({ message: 'Feedback submitted successfully' }))
    .catch(err => res.status(500).json({ error: 'Failed to submit feedback' }));
});

module.exports = router;
