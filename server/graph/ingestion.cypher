// ===============================================
// 2. DATA INGESTION (MERCGE TEMPLATES)
// Use these parameterized queries in Node.js to sync MySQL data
// ===============================================

// --- Sync Vehicle ---
MERGE (v:Vehicle {id: $vehicleId})
SET v.model = $model, v.fueltype = $fueltype, v.kmdriven = $kmdriven;

// --- Sync Owner ---
MERGE (o:Owner {id: $ownerId})
SET o.name = $username;

// --- Sync Service Center ---
MERGE (sc:ServiceCenter {id: $centerId})
SET sc.name = $centerName, sc.location = $location;

// --- Sync Service Record ---
MERGE (sr:ServiceRecord {id: $bookingId})
SET sr.date = $bookingDate, sr.type = $serviceType, sr.cost = $price, sr.km = $km;


// --- Establishing Relationships ---

// 1. Ownership tracking (Current or Historical)
MATCH (o:Owner {id: $ownerId})
MATCH (v:Vehicle {id: $vehicleId})
MERGE (o)-[r:OWNS]->(v)
ON CREATE SET r.from = $fromDate, r.to = $toDate
ON MATCH SET r.to = $toDate;

// 2. Ownership transfer
// (Triggered when a vehicle is sold in MySQL)
MATCH (prev:Owner {id: $oldOwnerId})
MATCH (next:Owner {id: $newOwnerId})
MERGE (prev)-[:SOLD_TO {date: $transferDate}]->(next);

// 3. Service tracking (Vehicle and Record)
MATCH (v:Vehicle {id: $vehicleId})
MATCH (sr:ServiceRecord {id: $bookingId})
MERGE (v)-[:HAS_SERVICE]->(sr);

// 4. Service execution (Record and Center)
MATCH (sr:ServiceRecord {id: $bookingId})
MATCH (sc:ServiceCenter {id: $centerId})
MERGE (sr)-[:DONE_AT]->(sc);

// 5. Service request (Owner and Record)
MATCH (o:Owner {id: $ownerId})
MATCH (sr:ServiceRecord {id: $bookingId})
MERGE (o)-[:REQUESTED_SERVICE]->(sr);
