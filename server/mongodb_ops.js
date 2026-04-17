/*CREATE COLLECTIONS SYNTAX*/
db.createCollection('feedbacks')
db.createCollection('vehiclesummaries')
db.createCollection('images')
db.createCollection('servicereviews')
db.createCollection('vehicles')
db.createCollection('servicebookings')

const { getMongoDB } = require('./config/mongo_util');

/*CREATE*/

/*Logs a new user feedback entry to the 'feedbacks' collection.*/
async function insertFeedback(data) {
    const mongo = getMongoDB();
    return await mongo.collection('feedbacks').insertOne({
        userid: data.userId,
        username: data.username,
        feedback: data.feedback,
        createdAt: new Date()
    });
}

/*Logs a text/AI summary for a specific vehicle.*/
async function insertVehicleSummary(data) {
    const mongo = getMongoDB();
    return await mongo.collection('vehiclesummaries').insertOne({
        vehicleId: parseInt(data.vehicleId),
        model: data.model,
        summary: data.summary,
        createdAt: new Date()
    });
}

/*Stores a legacy binary image into the 'images' collection.*/
async function insertLegacyImage(data) {
    const mongo = getMongoDB();
    return await mongo.collection('images').insertOne({
        filename: data.filename,
        contentType: data.mimetype,
        data: data.buffer,
        createdAt: new Date()
    });
}

/*Logs a new review/rating for a specific service center. */
async function insertServiceReview(data) {
    const mongo = getMongoDB();
    return await mongo.collection('servicereviews').insertOne({
        centerId: parseInt(data.centerId),
        userId: parseInt(data.userId),
        username: data.username,
        rating: parseInt(data.rating),
        review: data.review,
        createdAt: new Date()
    });
}

/*Inserts a vehicle record into MongoDB for high-speed filtering.*/
async function insertVehicle(data) {
    const mongo = getMongoDB();
    return await mongo.collection('vehicles').insertOne({
        vehicle_id: parseInt(data.vehicleid),
        model: data.model,
        price: parseFloat(data.price),
        fueltype: data.fueltype,
        transmission: data.transmission,
        kmdriven: parseInt(data.kmdriven),
        timestamp: new Date()
    });
}

/*Logs a new service booking for a service center.*/
async function insertServiceBooking(data) {
    const mongo = getMongoDB();
    return await mongo.collection('servicebookings').insertOne({
        centerId: parseInt(data.centerId),
        userId: parseInt(data.userId),
        serviceName: data.serviceName,
        bookingDate: new Date(data.bookingDate),
        status: data.status || 'Pending',
        createdAt: new Date()
    });
}

/*UPDATE*/

/*Updates an existing vehicle record in the 'vehicles' collection.*/
async function updateVehicle(id, data) {
    const mongo = getMongoDB();
    return await mongo.collection('vehicles').updateOne(
        { vehicle_id: parseInt(id) },
        {
            $set: {
                model: data.model,
                price: parseFloat(data.price),
                fueltype: data.fueltype,
                transmission: data.transmission,
                kmdriven: parseInt(data.kmdriven),
                updated_at: new Date()
            }
        }
    );
}

/*Updates an existing vehicle summary in MongoDB.*/
async function updateVehicleSummary(id, data) {
    const mongo = getMongoDB();
    return await mongo.collection('vehiclesummaries').updateOne(
        { vehicleId: parseInt(id) },
        {
            $set: {
                model: data.model,
                summary: data.summary,
                updatedAt: new Date()
            }
        },
        { upsert: true }
    );
}

/*Updates an existing service review in MongoDB.*/
async function updateServiceReview(centerId, userId, data) {
    const mongo = getMongoDB();
    return await mongo.collection('servicereviews').updateOne(
        {
            centerId: parseInt(centerId),
            userId: parseInt(userId)
        },
        {
            $set: {
                rating: parseInt(data.rating),
                review: data.review,
                updatedAt: new Date()
            }
        },
        { upsert: true }
    );
}

/*Updates the status of a service booking.*/
async function updateBookingStatus(bookingId, newStatus) {
    const mongo = getMongoDB();
    const { ObjectId } = require('mongodb');
    return await mongo.collection('servicebookings').updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { status: newStatus, updatedAt: new Date() } }
    );
}

/*DELETE*/

/*Removes a vehicle, its summary, and associated binary images from MongoDB when deleted/sold.*/
async function deleteVehicleRecords(id) {
    const mongo = getMongoDB();
    await mongo.collection('vehicles').deleteOne({ vehicle_id: parseInt(id) });
    await mongo.collection('vehiclesummaries').deleteOne({ vehicleId: parseInt(id) });
    await mongo.collection('images').deleteMany({ vehicleId: parseInt(id) });
}

/*Removes a service booking record.*/
async function deleteBooking(bookingId) {
    const mongo = getMongoDB();
    const { ObjectId } = require('mongodb');
    return await mongo.collection('servicebookings').deleteOne({ _id: new ObjectId(bookingId) });
}

/*AGGREGATIONS (READ)*/

/*Retrieves vehicles using a filtering pipeline (Price & Fuel Type).*/
async function getVehiclesByFilter(min, max, fuel, sort = 1) {
    const mongo = getMongoDB();
    const pipeline = [
        {
            $match: {
                price: { $gte: parseFloat(min), $lte: parseFloat(max) },
                ...(fuel && { fueltype: fuel })
            }
        },
        { $sort: { price: sort } }
    ];
    return await mongo.collection('vehicles').aggregate(pipeline).toArray();
}

/*Calculates average ratings and review counts using a grouping pipeline.*/
async function getCenterRatingStats(centerId) {
    const mongo = getMongoDB();
    const pipeline = [
        { $match: { centerId: parseInt(centerId) } },
        {
            $group: {
                _id: "$centerId",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ];
    return await mongo.collection('servicereviews').aggregate(pipeline).toArray();
}

module.exports = {
    insertFeedback,
    insertVehicleSummary,
    insertLegacyImage,
    insertServiceReview,
    insertVehicle,
    insertServiceBooking,
    updateVehicle,
    updateVehicleSummary,
    updateServiceReview,
    updateBookingStatus,
    deleteVehicleRecords,
    deleteBooking,
    getVehiclesByFilter,
    getCenterRatingStats
};