const { getNeoSession } = require('./config/neo4j_util');



async function getCollaborativeRecommendations(userId) {
    const session = getNeoSession();
    try {
        const result = await session.run(
            `MATCH (u:User {id: $uId})-[:PURCHASED_PART]->(p1:Part)<-[:PURCHASED_PART]-(other:User)-[:PURCHASED_PART]->(p2:Part)
             WHERE u <> other 
             AND NOT (u)-[:PURCHASED_PART]->(p2)
             RETURN DISTINCT p2.id as id, p2.name as name, count(other) as score
             ORDER BY score DESC
             LIMIT 5`,
            { uId: parseInt(userId) }
        );
        return result.records.map(r => ({
            id: r.get('id'),
            name: r.get('name'),
            score: r.get('score').low
        }));
    } finally {
        await session.close();
    }
}


async function getFrequentlyBoughtTogether(partId) {
    const session = getNeoSession();
    try {
        const result = await session.run(
            `MATCH (p1:Part {id: $pId})<-[:PURCHASED_PART]-(u:User)-[:PURCHASED_PART]->(p2:Part)
             WHERE p1.id <> p2.id
             RETURN p2.id as id, p2.name as name, count(DISTINCT u) as strength
             ORDER BY strength DESC
             LIMIT 5`,
            { pId: parseInt(partId) }
        );
        return result.records.map(r => ({
            id: r.get('id'),
            name: r.get('name'),
            strength: r.get('strength').low
        }));
    } finally {
        await session.close();
    }
}



async function getVehicleHistory(vehicleId) {
    const session = getNeoSession();
    try {
        const result = await session.run(
            `MATCH (v:Vehicle {id: $vId})
             OPTIONAL MATCH (o:Owner)-[own:OWNS]->(v)
             OPTIONAL MATCH (v)-[:HAS_SERVICE]->(sr:ServiceRecord)-[:DONE_AT]->(sc:ServiceCenter)
             RETURN v.model as model, v.fueltype as fueltype, v.kmdriven as kmdriven,
                    collect(DISTINCT {owner: o.name, from: own.from, to: own.to, status: own.status}) as owners,
                    collect(DISTINCT {service: sr.type, date: sr.date, center: sc.name, cost: sr.cost, km: sr.km}) as services`,
            { vId: parseInt(vehicleId) }
        );
        if (result.records.length === 0) return null;
        const rec = result.records[0];


                let owners = rec.get('owners').filter(o => o.owner);
        owners.sort((a, b) => (a.from || '').localeCompare(b.from || ''));

        return {
            model: rec.get('model'),
            fueltype: rec.get('fueltype'),
            kmdriven: rec.get('kmdriven'),
            owners: owners,
            services: rec.get('services')
        };
    } finally {
        await session.close();
    }
}

async function detectOdometerFraud(vehicleId) {
    const session = getNeoSession();
    try {
        const result = await session.run(
            `MATCH (v:Vehicle {id: $vId})-[:HAS_SERVICE]->(sr1:ServiceRecord),
                   (v)-[:HAS_SERVICE]->(sr2:ServiceRecord)
             WHERE sr1.date < sr2.date AND sr1.km > sr2.km
             RETURN sr1.date as earlierDate, sr1.km as higherKm,
                    sr2.date as laterDate, sr2.km as lowerKm,
                    (sr1.km - sr2.km) as discrepancy
             ORDER BY discrepancy DESC`,
            { vId: parseInt(vehicleId) }
        );
        return result.records.map(r => ({
            earlierDate: r.get('earlierDate'),
            higherKm: r.get('higherKm'),
            laterDate: r.get('laterDate'),
            lowerKm: r.get('lowerKm'),
            discrepancy: r.get('discrepancy')
        }));
    } finally {
        await session.close();
    }
}



async function recordView(userId, itemId, itemType) {
    const session = getNeoSession();
    try {
        const label = itemType === 'vehicle' ? 'Vehicle' : 'Part';
        const rel = itemType === 'vehicle' ? 'VIEWED_VEHICLE' : 'VIEWED_PART';
        await session.run(
            `MERGE (u:User {id: $uId})
             MERGE (i:${label} {id: $iId})
             MERGE (u)-[r:${rel}]->(i)
             ON CREATE SET r.timestamp = timestamp()
             ON MATCH SET r.timestamp = timestamp(), r.viewCount = COALESCE(r.viewCount, 0) + 1`,
            { uId: parseInt(userId), iId: parseInt(itemId) }
        );
    } finally {
        await session.close();
    }
}

async function recordPartPurchase(userId, partid) {
    const session = getNeoSession();
    try {
        await session.run(
            `MERGE (u:User {id: $uId})
             MERGE (p:Part {id: $pId})
             MERGE (u)-[r:PURCHASED_PART]->(p)
             ON CREATE SET r.timestamp = timestamp()
             ON MATCH SET r.timestamp = timestamp()`,
            { uId: parseInt(userId), pId: parseInt(partid) }
        );
    } finally {
        await session.close();
    }
}

async function recordPurchase(buyerId, sellerId, vehicleId) {
    const session = getNeoSession();
    try {
        await session.run(
            `MATCH (v:Vehicle {id: $vId})
             MATCH (buyer:User {id: $bId})
             MATCH (seller:User {id: $sId})
             OPTIONAL MATCH (seller)-[old:OWNS]->(v)
             SET old.to = date(), old.status = 'Past Owner'
             MERGE (buyer)-[r:OWNS]->(v)
             SET r.from = date(), r.status = 'Present'
             MERGE (buyer)-[:PURCHASED_VEHICLE]->(v)`,
            { vId: parseInt(vehicleId), bId: parseInt(buyerId), sId: parseInt(sellerId) }
        );
    } finally {
        await session.close();
    }
}

async function recordCancellation(buyerId, vehicleId) {
    const session = getNeoSession();
    try {
        await session.run(
            `MATCH (u:User {id: $uId}), (v:Vehicle {id: $vId})
             MERGE (u)-[r:CANCELLED_DEAL]->(v)
             ON CREATE SET r.count = 1, r.lastCancelled = timestamp()
             ON MATCH SET r.count = r.count + 1, r.lastCancelled = timestamp()`,
            { uId: parseInt(buyerId), vId: parseInt(vehicleId) }
        );
    } finally {
        await session.close();
    }
}


module.exports = {
        getCollaborativeRecommendations,
    getFrequentlyBoughtTogether,
        getVehicleHistory,
    detectOdometerFraud,
        recordView,
    recordPartPurchase,
    recordPurchase,
    recordCancellation
};
