const mongoose = require('mongoose');

const getMongoDB = () => {
    if (!mongoose.connection || !mongoose.connection.db) {
        return null;
    }
    return mongoose.connection.db;
};

const initCollections = async () => {
    const mongo = getMongoDB();
    if (!mongo) return;

    try {
        console.log("Initialising MongoDB Collection Syntax...");


                await mongo.collection('vehicles').createIndex({ vehicleId: 1 }, { unique: true });
        await mongo.collection('vehicles').createIndex({ price: 1 });
        await mongo.collection('vehicles').createIndex({ fueltype: 1 });


                await mongo.collection('feedbacks').createIndex({ userid: 1 });
        await mongo.collection('feedbacks').createIndex({ createdAt: -1 });


                await mongo.collection('vehiclesummaries').createIndex({ vehicleId: 1 }, { unique: true });


                await mongo.collection('images').createIndex({ filename: 1 });
        await mongo.collection('images').createIndex({ createdAt: -1 });



                        await mongo.collection('servicereviews').createIndex({ centerId: 1 });
        await mongo.collection('servicereviews').createIndex({ createdAt: -1 });


                await mongo.collection('sensor_readings').createIndex({ timestamp: -1 });

        console.log("--- MongoDB Collections & Indexes Synced Successfully ---");
    } catch (err) {
        if (err.codeName !== 'NamespaceExists') {
            console.error("MongoDB Syntax Initialisation Error:", err.message);
        }
    }
};

module.exports = { getMongoDB, initCollections };
