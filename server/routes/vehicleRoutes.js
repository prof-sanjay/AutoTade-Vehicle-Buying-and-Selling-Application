const express = require("express");
const router = express.Router();
const { db } = require("../db");
const multer = require("multer");
const path = require("path");

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ADD VEHICLE (Seller)
router.post("/add", upload.array("images", 8), async (req, res) => {
    const {
        seller_userid, model, vehicleregistration, dateofmanufacture,
        kmdriven, engine, fueltype, transmission, color,
        mileage, locationid, price
    } = req.body;

    try {
        // 1. Insert Vehicle
        const sql = `INSERT INTO vehicle 
      (seller_userid, model, vehicleregistration, dateofmanufacture, kmdriven, engine, fueltype, transmission, color, mileage, locationid, price, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`;

        const [result] = await db.query(sql, [
            seller_userid, model, vehicleregistration, dateofmanufacture,
            kmdriven, engine, fueltype, transmission, color,
            mileage, locationid, price
        ]);

        const vehicleId = result.insertId;

        // 2. Insert Images
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [vehicleId, "/uploads/" + file.filename]);
            await db.query("INSERT INTO vehicleimage (VehicleID, ImagePath) VALUES ?", [imageValues]);
        }

        res.status(201).json({ message: "Vehicle added", vehicleId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET ALL VEHICLES
router.get("/", async (req, res) => {
    try {
        // Simple fetch, usually we join with images in a real app or fetch images separately
        // Let's join with one image for preview
        const { featured } = req.query;
        let sql = `
      SELECT v.*, i.ImagePath as previewImage 
      FROM vehicle v 
      LEFT JOIN (
         SELECT VehicleID, MIN(ImagePath) as ImagePath 
         FROM vehicleimage 
         GROUP BY VehicleID
      ) i ON v.vehicleid = i.VehicleID
    `;

        if (featured === "true") {
            sql += " WHERE v.featured = 1";
        }

        const [vehicles] = await db.query(sql);
        res.json(vehicles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
});

// GET SINGLE VEHICLE
router.get("/:id", async (req, res) => {
    try {
        const sql = `
            SELECT v.*, 
                   f.fc_id, f.issuedate, f.expirydate, f.status as fc_status,
                   u.name as sellername, u.phonenumber as sellerphone, u.email as selleremail
            FROM vehicle v
            LEFT JOIN fitnesscertificate f ON v.vehicleid = f.vehicleid
            LEFT JOIN user u ON v.seller_userid = u.userid
            WHERE v.vehicleid = ?
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Vehicle not found" });

        const [images] = await db.query("SELECT * FROM vehicleimage WHERE VehicleID = ?", [req.params.id]);

        res.json({ ...rows[0], images });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching vehicle" });
    }
});

// GET SELLER VEHICLES (My Listings)
router.get("/my-vehicles/:sellerId", async (req, res) => {
    try {
        const { sellerId } = req.params;
        const sql = `
            SELECT v.*, i.ImagePath as previewImage 
            FROM vehicle v 
            LEFT JOIN (
                SELECT VehicleID, MIN(ImagePath) as ImagePath 
                FROM vehicleimage 
                GROUP BY VehicleID
            ) i ON v.vehicleid = i.VehicleID
            WHERE v.seller_userid = ?
            ORDER BY v.created_at DESC
        `;
        const [vehicles] = await db.query(sql, [sellerId]);
        res.json(vehicles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch seller vehicles" });
    }
});

module.exports = router;
