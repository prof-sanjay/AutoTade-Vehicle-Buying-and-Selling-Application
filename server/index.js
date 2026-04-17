const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── MongoDB Connection ─────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");
        const { initCollections } = require("./config/mongo_util");
        initCollections();
    })
    .catch(err => console.error("MongoDB connection error:", err.message));

// ── Neo4j Connection test ──────────────────────────────
const { getNeoSession } = require("./config/neo4j_util");
(async () => {
    const session = getNeoSession();
    try {
        await session.run("RETURN 1");
        console.log("Neo4j connected");
    } catch (err) {
        console.error("Neo4j connection error:", err.message);
    } finally {
        await session.close();
    }
})();

// ── Routes ────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/parts", require("./routes/partsRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));

// Test Route
app.get("/", (req, res) => {
    res.send("AutoTrade API Running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
