const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Import Routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/parts", require("./routes/partsRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));

// Test Route
app.get("/", (req, res) => {
    res.send("AutoTrade API Running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
