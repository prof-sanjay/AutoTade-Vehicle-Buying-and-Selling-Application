const express = require('express');
const router = express.Router();
const {
    getCollaborativeRecommendations,
    getFrequentlyBoughtTogether,
    getVehicleHistory,
    detectOdometerFraud,
    recordView
} = require('../neo4j_ops');



router.get('/parts/:userId', async (req, res) => {
    try {
        const recs = await getCollaborativeRecommendations(req.params.userId);
        res.json({ recommendations: recs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});


router.get('/frequently-bought/:partId', async (req, res) => {
    try {
        const recs = await getFrequentlyBoughtTogether(req.params.partId);
        res.json({ recommendations: recs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});



router.get('/vehicle-history/:vehicleId', async (req, res) => {
    try {
        const history = await getVehicleHistory(req.params.vehicleId);
        if (!history) return res.status(404).json({ error: "Vehicle not found in graph" });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vehicle history" });
    }
});


router.get('/fraud-check/:vehicleId', async (req, res) => {
    try {
        const anomalies = await detectOdometerFraud(req.params.vehicleId);
        res.json({ flagged: anomalies.length > 0, anomalies });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to run fraud check" });
    }
});



router.post('/trace-activity', async (req, res) => {
    const { userId, itemId, itemType } = req.body;
    try {
        if (itemType === 'purchase') {
            await recordPartPurchase(userId, itemId);
        } else {
            await recordView(userId, itemId, itemType);
        }
        res.json({ message: "Activity recorded" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to record activity" });
    }
});

module.exports = router;
