const { db } = require('./db');
const { getNeoSession } = require('./config/neo4j_util');

async function syncProjectGraph() {
    console.log("🚀 Starting Comprehensive Graph Synchronization...");
    const session = getNeoSession();

    try {

                const [users] = await db.query("SELECT userid, username, role FROM user");
        console.log(`- Processing ${users.length} Users...`);
        for (const u of users) {
             const labels = u.role === 'user' ? "User:Owner" : "User";
             await session.run(
                 `MERGE (u:User {id: $id}) 
                  SET u.name = $name, u.role = $role 
                  WITH u 
                  WHERE $role = 'user' 
                  SET u:Owner`, 
                 { id: u.userid, name: u.username, role: u.role }
             );
        }


                const [vehicles] = await db.query("SELECT vehicleid, model, fueltype, kmdriven, seller_userid FROM vehicles");
        console.log(`- Processing ${vehicles.length} Vehicles...`);
        for (const v of vehicles) {
            await session.run(
                `MERGE (v:Vehicle {id: $id}) 
                 SET v.model = $model, v.fueltype = $fuel, v.kmdriven = $km`,
                { id: v.vehicleid, model: v.model, fuel: v.fueltype, km: v.kmdriven }
            );

                        await session.run(
                `MATCH (u:User {id: $uId})
                 MATCH (v:Vehicle {id: $vId})
                 MERGE (u)-[r:OWNS]->(v)
                 ON CREATE SET r.from = 'Creation', r.status = 'Present'`,
                { uId: v.seller_userid, vId: v.vehicleid }
            );
        }


                const [parts] = await db.query("SELECT partid, partname, description FROM parts");
        console.log(`- Processing ${parts.length} Parts...`);
        for (const part of parts) {
             await session.run(
                 "MERGE (p:Part {id: $id}) SET p.name = $name", 
                 { id: part.partid, name: part.partname }
             );
        }


                const [centers] = await db.query("SELECT userid, username, address FROM user WHERE role = 'service_center'");
        console.log(`- Processing ${centers.length} Service Centers...`);
        for (const sc of centers) {
            await session.run(
                "MERGE (sc:ServiceCenter {id: $id}) SET sc.name = $name, sc.location = $location", 
                { id: sc.userid, name: sc.username, location: sc.address }
            );
        }


                const [bookings] = await db.query(`
            SELECT b.*, s.servicename, s.price as cost 
            FROM service_bookings b
            JOIN services s ON b.serviceid = s.serviceid
            WHERE b.status = 'Completed'
        `);
        console.log(`- Processing ${bookings.length} Service Records...`);
        for (const b of bookings) {
            await session.run(
                `MERGE (v:Vehicle {id: $vId})
                 MERGE (sc:ServiceCenter {id: $scId})
                 MERGE (u:Owner {id: $uId})
                 MERGE (sr:ServiceRecord {id: $bId})
                 SET sr.type = $type, sr.date = $date, sr.km = $km, sr.cost = $cost
                 MERGE (v)-[:HAS_SERVICE]->(sr)
                 MERGE (sr)-[:DONE_AT]->(sc)
                 MERGE (u)-[:REQUESTED_SERVICE]->(sr)`,
                { 
                    vId: b.vehicleid, 
                    scId: b.centerid, 
                    uId: b.userid,
                    bId: b.bookingid, 
                    type: b.servicename, 
                    cost: b.cost,
                    date: b.bookingdate ? b.bookingdate.toISOString().split('T')[0] : 'Unknown',
                    km: b.notes ? (parseInt(b.notes.match(/\d+/)) || (b.vehicleid * 100)) : (b.bookingid * 500)
                }
            );
        }


                const [sales] = await db.query("SELECT * FROM orders WHERE status = 'Completed'");
        console.log(`- Processing ${sales.length} Ownership Transfers...`);
        for (const sale of sales) {
            await session.run(
                `MATCH (v:Vehicle {id: $vId})
                 MATCH (buyer:Owner {id: $bId})
                 MATCH (seller:User {id: $sId})
                 OPTIONAL MATCH (seller)-[old:OWNS]->(v)
                 SET old.to = $date, old.status = 'Past Owner'
                 MERGE (buyer)-[r:OWNS]->(v)
                 SET r.from = $date, r.status = 'Present'`,
                { 
                    vId: sale.vehicleid, 
                    bId: sale.buyer_userid, 
                    sId: sale.seller_userid, 
                    date: sale.orderdate ? sale.orderdate.toISOString().split('T')[0] : 'Unknown' 
                }
            );
        }

        console.log("✅ Graph Ingestion Complete!");

    } catch (err) {
        console.error("❌ Synchronization Failed:", err);
    } finally {
        await session.close();
        process.exit(0);
    }
}

syncProjectGraph();
