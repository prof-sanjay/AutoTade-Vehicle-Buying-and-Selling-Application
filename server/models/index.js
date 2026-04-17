const mongoose = require('mongoose');


const feedbackSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const imageSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    data: Buffer
}, { timestamps: true });


const serviceReviewSchema = new mongoose.Schema({
  centerId: { type: Number, required: true },
  userId: { type: Number, required: true },
  username: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: Number, required: true, unique: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  fueltype: { type: String, required: true },
  transmission: { type: String, required: true },
  kmdriven: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});


const vehicleSummarySchema = new mongoose.Schema({
  vehicleId: { type: Number, required: true, unique: true },
  model: { type: String, required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


module.exports = {
    Feedback: mongoose.model('Feedback', feedbackSchema),
    Image: mongoose.model('Image', imageSchema),
    ServiceReview: mongoose.model('ServiceReview', serviceReviewSchema),
    Vehicle: mongoose.model('Vehicle', vehicleSchema),
    VehicleSummary: mongoose.model('VehicleSummary', vehicleSummarySchema)
};
