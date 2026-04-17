// ===============================================
// 3. PROVENANCE & ANALYTIC QUERIES
// ===============================================

// 1. Full Vehicle History
// Retrieve all owners, service records, and service centers for a specific vehicle (by ID)
MATCH (v:Vehicle {id: 101})
OPTIONAL MATCH (o:Owner)-[own:OWNS]->(v)
OPTIONAL MATCH (v)-[:HAS_SERVICE]->(sr:ServiceRecord)-[:DONE_AT]->(sc:ServiceCenter)
RETURN v, 
       collect(DISTINCT {owner: o.name, from: own.from, to: own.to}) AS ownership_history,
       collect(DISTINCT {service: sr.type, date: sr.date, center: sc.name, km: sr.km}) AS service_history
ORDER BY own.from DESC;


// 2. Ownership Timeline
// Show chronological ownership progression using relationship properties
MATCH (o:Owner)-[r:OWNS]->(v:Vehicle {id: 101})
RETURN o.name AS owner_name, r.from AS starts, r.to AS ends
ORDER BY r.from ASC;


// 3. Service History Details
// List all services performed on a vehicle with specific details
MATCH (v:Vehicle {id: 101})-[:HAS_SERVICE]->(sr:ServiceRecord)
MATCH (sr)-[:DONE_AT]->(sc:ServiceCenter)
RETURN sr.date AS date, sr.type AS service, sc.name AS center, sr.km AS mileage, sr.cost AS price
ORDER BY sr.date DESC;


// 4. Anomaly Detection (Odometer Fraud)
// Detect inconsistent odometer readings where a later service has fewer km than an earlier one
MATCH (v:Vehicle)-[:HAS_SERVICE]->(sr1:ServiceRecord)
MATCH (v)-[:HAS_SERVICE]->(sr2:ServiceRecord)
WHERE sr1.date < sr2.date AND sr1.km > sr2.km
RETURN v.id AS vehicle_id, v.model AS model, 
       sr1.date AS earlier_service, sr1.km AS higher_km,
       sr2.date AS later_service, sr2.km AS lower_km,
       (sr1.km - sr2.km) AS discrepancy
ORDER BY discrepancy DESC;


// 5. Frequent Service Vehicles
// Find vehicles with the highest number of service records recorded
MATCH (v:Vehicle)-[:HAS_SERVICE]->(sr:ServiceRecord)
RETURN v.id AS id, v.model AS model, v.fueltype AS fueltype, count(sr) AS total_services
ORDER BY total_services DESC
LIMIT 10;


// 6. Owner Activity
// Find owners who have requested the most services across their vehicle fleet
MATCH (o:Owner)-[:REQUESTED_SERVICE]->(sr:ServiceRecord)
RETURN o.id AS id, o.name AS owner_name, count(sr) AS total_requests
ORDER BY total_requests DESC
LIMIT 5;
