import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../index.css";

export default function ServiceDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const [searchParams] = useSearchParams();
    const [bookings, setBookings] = useState([]);
    const [myParts, setMyParts] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [activeTab, setActiveTab] = useState("bookings");
    const [newPart, setNewPart] = useState({ partname: "", partnumber: "", partprice: "" });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setActiveTab(searchParams.get("tab") || "bookings");
    }, [searchParams]);

    useEffect(() => {
        if (!user || user.role !== 'service_center') {
            navigate("/");
            return;
        }
        fetchData();
    }, [user, navigate]);

    function fetchData() {
        setLoading(true);
        const p1 = fetch(`http://localhost:5000/api/services/bookings/${user.id}?role=service_center`)
            .then(res => res.json())
            .then(data => setBookings(data));

        const p2 = fetch(`http://localhost:5000/api/services/types`)
            .then(res => res.json())
            .then(data => setServiceTypes(data));

        const p3 = fetch(`http://localhost:5000/api/parts/my-orders/${user.id}?role=service_center`)
            .then(res => res.json())
            .then(data => setMyParts(data));

        Promise.all([p1, p2, p3]).then(() => setLoading(false));
    }

    function handleVerifyBooking(serviceId) {
        if (!confirm("Verify service completed?")) return;
        fetch("http://localhost:5000/api/services/verify-booking", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceId })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fetchData();
            });
    }

    function handleAddPart(e) {
        e.preventDefault();
        fetch("http://localhost:5000/api/services/centers")
            .then(res => res.json())
            .then(centers => {
                const myCenter = centers.find(c => c.userid === user.id);
                if (myCenter) {
                    submitPart(myCenter.centerid);
                } else {
                    alert("Service Center profile not found!");
                }
            });
    }

    function submitPart(centerId) {
        fetch("http://localhost:5000/api/parts/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newPart, centerid: centerId })
        })
            .then(res => res.json())
            .then(() => {
                alert("Part Added");
                setNewPart({ partname: "", partnumber: "", partprice: "" });
            });
    }

    // Filter Bookings
    
    const activeBookings = bookings.filter(b => b.paymentstatus !== 'Completed');

    const historyBookings = bookings.filter(b => b.paymentstatus === 'Completed');

    return (



        <div className="container" style={{ marginTop: "30px" }}>
            <h2>Service Dashboard</h2>
                    {/* TAB 1: ACTIVE BOOKINGS */}



            {loading ? <p>Loading dashboard data...</p> : (
                <>
                    
                    {activeTab === "bookings" && (
                        <div>
                            <h3>Incoming Service Bookings (Active)</h3>
                            {activeBookings.length === 0 ? <p>No active bookings.</p> : (
                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                                    <thead>
                                        <tr style={{ background: "#eee", textAlign: "left" }}>
                                            <th style={{ padding: "10px" }}>Service</th>
                                            <th style={{ padding: "10px" }}>Vehicle</th>
                                            <th style={{ padding: "10px" }}>Customer</th>
                                            <th style={{ padding: "10px" }}>Date/Time</th>
                                            <th style={{ padding: "10px" }}>Status</th>
                                            <th style={{ padding: "10px" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeBookings.map(b => (
                                            <tr key={b.serviceid} style={{ borderBottom: "1px solid #ddd" }}>
                                                <td style={{ padding: "10px" }}>{b.servicename}</td>
                                                <td style={{ padding: "10px" }}>{b.model} ({b.vehicleregistration})</td>
                                                <td style={{ padding: "10px" }}>{b.customer_name}</td>
                                                <td style={{ padding: "10px" }}>{new Date(b.servicedate).toLocaleDateString()} {b.servicetime}</td>
                                                <td style={{ padding: "10px" }}>{b.paymentstatus}</td>
                                                <td style={{ padding: "10px" }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                                                        onClick={() => handleVerifyBooking(b.serviceid)}
                                                    >
                                                        Mark Complete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    
                    {activeTab === "services" && (
                        <div>
                            <h3>Offered Services</h3>
                            <p>These are the standard services available at your center.</p>
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                                <thead>
                                    <tr style={{ background: "#eee", textAlign: "left" }}>
                                        <th style={{ padding: "10px" }}>Service Name</th>
                                        <th style={{ padding: "10px" }}>Base Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceTypes.map(s => (
                                        <tr key={s.servicetypeid} style={{ borderBottom: "1px solid #ddd" }}>

                    {/* TAB 3: SERVICE HISTORY */}
                                            <td style={{ padding: "10px" }}>{s.servicename}</td>
                                            <td style={{ padding: "10px" }}>₹ {s.baseprice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    
                    {activeTab === "history" && (
                        <div>
                            <h3>Completed Service History</h3>
                            {historyBookings.length === 0 ? <p>No completed services yet.</p> : (
                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                                    <thead>
                                        <tr style={{ background: "#eee", textAlign: "left" }}>
                                            <th style={{ padding: "10px" }}>Service</th>
                                            <th style={{ padding: "10px" }}>Vehicle</th>
                                            <th style={{ padding: "10px" }}>Customer</th>
                                            <th style={{ padding: "10px" }}>Completed Date</th>
                                            <th style={{ padding: "10px" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyBookings.map(b => (
                                            <tr key={b.serviceid} style={{ borderBottom: "1px solid #ddd" }}>
                                                <td style={{ padding: "10px" }}>{b.servicename}</td>
                                                <td style={{ padding: "10px" }}>{b.model} ({b.vehicleregistration})</td>
                                                <td style={{ padding: "10px" }}>{b.customer_name}</td>
                                                <td style={{ padding: "10px" }}>{new Date(b.servicedate).toLocaleDateString()}</td>

                    {/* TAB 4: PARTS MANAGEMENT */}
                                                <td style={{ padding: "10px" }}>
                                                    <span style={{ color: "green", fontWeight: "bold" }}>Completed</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    
                    {activeTab === "parts" && (
                        <div>
                            <div style={{ background: "#f9f9f9", padding: "20px", marginBottom: "20px" }}>
                                <h3>Add New Part</h3>
                                <form onSubmit={handleAddPart} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px" }}>
                                    <input
                                        placeholder="Part Name"
                                        value={newPart.partname}
                                        onChange={e => setNewPart({ ...newPart, partname: e.target.value })}
                                        required
                                        style={{ padding: "8px" }}
                                    />
                                    <input
                                        placeholder="Part Number"
                                        value={newPart.partnumber}
                                        onChange={e => setNewPart({ ...newPart, partnumber: e.target.value })}
                                        required
                                        style={{ padding: "8px" }}

                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newPart.partprice}
                                        onChange={e => setNewPart({ ...newPart, partprice: e.target.value })}
                                        required
                                        style={{ padding: "8px" }}
                                    />
                                    <button type="submit" className="btn btn-primary">Add Part</button>
                                </form>
                            </div>

                            <h3>Sold Parts History</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#eee", textAlign: "left" }}>
                                        <th style={{ padding: "10px" }}>Part Name</th>
                                        <th style={{ padding: "10px" }}>Part Number</th>
                                        <th style={{ padding: "10px" }}>Buyer</th>
                                        <th style={{ padding: "10px" }}>Price</th>
                                        <th style={{ padding: "10px" }}>Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myParts.map(p => (
                                        <tr key={p.orderid} style={{ borderBottom: "1px solid #ddd" }}>
                                            <td style={{ padding: "10px" }}>{p.partname}</td>
                                            <td style={{ padding: "10px" }}>{p.partnumber}</td>
                                            <td style={{ padding: "10px" }}>{p.buyername}</td>

                                            <td style={{ padding: "10px" }}>₹ {p.partprice}</td>
                                            <td style={{ padding: "10px" }}>{p.paymentstatus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
