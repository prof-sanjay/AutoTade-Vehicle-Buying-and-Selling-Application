import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Trash2, Shield, Car, Star, MessageSquare, History, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("users");

    
    const [historyVehicleId, setHistoryVehicleId] = useState("");
    const [vehicleHistory, setVehicleHistory] = useState(null);
    const [fraudResult, setFraudResult] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate("/home");
            return;
        }
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchData() {
        setLoading(true);

        const safe = (promise) => promise.catch(() => null);

        const [usersData, vehiclesData, feedbacksData] = await Promise.all([
            safe(fetch("http://localhost:5000/api/admin/users").then(r => r.json())),
            safe(fetch("http://localhost:5000/api/admin/vehicles").then(r => r.json())),
            safe(fetch("http://localhost:5000/api/admin/feedback/list").then(r => r.json())),
        ]);

        setUsers(Array.isArray(usersData) ? usersData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
        setFeedbacks(Array.isArray(feedbacksData) ? feedbacksData : []);
        setLoading(false);
    }

    async function handleUpdateRole(userId, newRole) {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                alert("Role updated");
                fetchData();
            }
        } catch (err) {
            alert("Update failed");
        }
    }

    async function handleDeleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, { method: "DELETE" });
            if (res.ok) {
                alert("User deleted");
                fetchData();
            }
        } catch (err) {
            alert("Delete failed");
        }
    }

    async function handleToggleFeatured(vehicleId, currentStatus) {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/vehicles/${vehicleId}/feature`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ featured: !currentStatus })
            });
            if (res.ok) {
                fetchData();
            } else {
                alert("Failed to update featured status");
            }
        } catch (err) {
            console.error(err);
            alert("Update failed");
        }
    }

    if (loading) return <div className="container"><h2>Loading Admin Panel...</h2></div>;

    return (
        <div className="container" style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                <Shield size={32} color="var(--primary)" />
                <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button 
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
                <button 
                    className={`btn ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('vehicles')}
                >
                    Manage Vehicles
                </button>
                <button 
                    className={`btn ${activeTab === 'feedbacks' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('feedbacks')}
                >
                    <MessageSquare size={16} style={{ marginRight: "5px" }} />
                    View Feedbacks
                </button>
                <button 
                    className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={16} style={{ marginRight: "5px" }} />
                    Vehicle History
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="card" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#eee", textAlign: "left" }}>
                                <th style={{ padding: "10px" }}>ID</th>
                                <th style={{ padding: "10px" }}>Username</th>
                                <th style={{ padding: "10px" }}>Change Role</th>
                                <th style={{ padding: "10px" }}>Email</th>
                                <th style={{ padding: "10px" }}>Contact</th>
                                <th style={{ padding: "10px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.userid} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "10px" }}>{u.userid}</td>
                                    <td style={{ padding: "10px" }}>{u.username}</td>
                                    <td style={{ padding: "10px" }}>
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleUpdateRole(u.userid, e.target.value)}
                                            style={{
                                                padding: "5px",
                                                borderRadius: "4px",
                                                border: "1px solid #ddd",
                                                background: u.role === 'admin' ? '#fdecea' : u.role === 'service_center' ? '#e8f5e9' : '#e3f2fd',
                                                color: u.role === 'admin' ? '#d32f2f' : u.role === 'service_center' ? '#2e7d32' : '#1565c0',
                                                fontWeight: "bold"
                                            }}
                                            disabled={u.role === 'admin' && users.filter(usr => usr.role === 'admin').length === 1}
                                        >
                                            <option value="user">User</option>
                                            <option value="service_center">Service Center</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: "10px" }}>{u.email}</td>
                                    <td style={{ padding: "10px" }}>{u.phonenumber}</td>
                                    <td style={{ padding: "10px" }}>
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDeleteUser(u.userid)}
                                                style={{ background: "none", border: "none", color: "#d32f2f", cursor: "pointer" }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'vehicles' && (
                <div className="card" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#eee", textAlign: "left" }}>
                                <th style={{ padding: "10px" }}>ID</th>
                                <th style={{ padding: "10px" }}>Model</th>
                                <th style={{ padding: "10px" }}>Seller</th>
                                <th style={{ padding: "10px" }}>Price</th>
                                <th style={{ padding: "10px" }}>Status</th>
                                <th style={{ padding: "10px" }}>Featured</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.vehicleid} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "10px" }}>{v.vehicleid}</td>
                                    <td style={{ padding: "10px" }}>{v.model} ({v.vehicleregistration})</td>
                                    <td style={{ padding: "10px" }}>{v.seller_name || 'N/A'}</td>
                                    <td style={{ padding: "10px" }}>₹ {v.price}</td>
                                    <td style={{ padding: "10px" }}>{v.status || 'Available'}</td>
                                    <td style={{ padding: "10px" }}>
                                        <button 
                                            onClick={() => handleToggleFeatured(v.vehicleid, v.featured)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: v.featured ? "#fbc02d" : "#ccc",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px"
                                            }}
                                            title={v.featured ? "Remove Featured" : "Mark as Featured"}
                                        >
                                            <Star size={24} fill={v.featured ? "#fbc02d" : "none"} />
                                            <span style={{ color: "black", fontSize: "0.85rem" }}>
                                                {v.featured ? "Featured" : "Regular"}
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'feedbacks' && (
                <div className="card" style={{ overflowX: "auto" }}>
                    {feedbacks.length === 0 ? (
                        <div style={{ padding: "30px", textAlign: "center", color: "#888" }}>
                            <MessageSquare size={40} style={{ marginBottom: "10px", opacity: 0.4 }} />
                            <p>No feedbacks yet.</p>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#eee", textAlign: "left" }}>
                                    <th style={{ padding: "10px" }}>#</th>
                                    <th style={{ padding: "10px" }}>Username</th>
                                    <th style={{ padding: "10px" }}>Feedback</th>
                                    <th style={{ padding: "10px" }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbacks.map((fb, index) => (
                                    <tr key={fb._id} style={{ borderBottom: "1px solid #ddd" }}>
                                        <td style={{ padding: "10px" }}>{index + 1}</td>
                                        <td style={{ padding: "10px", fontWeight: "600", color: "var(--primary)" }}>{fb.username}</td>
                                        <td style={{ padding: "10px", maxWidth: "400px", wordBreak: "break-word" }}>{fb.feedback}</td>
                                        <td style={{ padding: "10px", color: "#888", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                            {new Date(fb.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {}
            {activeTab === 'history' && (
                <div>
                    <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                            <History size={20} /> Vehicle History Lookup
                            <span style={{ fontSize: "0.75rem", background: "var(--primary)", color: "white", padding: "3px 8px", borderRadius: "12px", fontWeight: "normal" }}>Powered by Neo4j</span>
                        </h3>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <select
                                value={historyVehicleId}
                                onChange={e => setHistoryVehicleId(e.target.value)}
                                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", minWidth: "300px" }}
                            >
                                <option value="">-- Select a Vehicle --</option>
                                {vehicles.map(v => (
                                    <option key={v.vehicleid} value={v.vehicleid}>
                                        {v.model} ({v.vehicleregistration}) - ID: {v.vehicleid}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="btn btn-primary"
                                disabled={!historyVehicleId || historyLoading}
                                onClick={async () => {
                                    setHistoryLoading(true);
                                    setVehicleHistory(null);
                                    setFraudResult(null);
                                    try {
                                        const [hRes, fRes] = await Promise.all([
                                            fetch(`http://localhost:5000/api/recommendations/vehicle-history/${historyVehicleId}`).then(r => r.json()),
                                            fetch(`http://localhost:5000/api/recommendations/fraud-check/${historyVehicleId}`).then(r => r.json())
                                        ]);
                                        setVehicleHistory(hRes);
                                        setFraudResult(fRes);
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to fetch vehicle history from Neo4j");
                                    } finally {
                                        setHistoryLoading(false);
                                    }
                                }}
                            >
                                {historyLoading ? "Loading..." : "Lookup History"}
                            </button>
                        </div>
                    </div>

                    {vehicleHistory && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            {}
                            <div className="card" style={{ padding: "1.5rem" }}>
                                <h3 style={{ marginBottom: "1rem" }}><Car size={18} /> Vehicle Info</h3>
                                <p><strong>Model:</strong> {vehicleHistory.model}</p>
                                <p><strong>Fuel:</strong> {vehicleHistory.fueltype}</p>
                                <p><strong>KM Driven:</strong> {vehicleHistory.kmdriven}</p>
                            </div>

                            {}
                            <div className="card" style={{ padding: "1.5rem", borderLeft: fraudResult?.flagged ? "5px solid #d32f2f" : "5px solid #2e7d32" }}>
                                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <AlertTriangle size={18} /> Odometer Fraud Check
                                </h3>
                                {fraudResult?.flagged ? (
                                    <div>
                                        <p style={{ color: "#d32f2f", fontWeight: "bold", marginBottom: "10px" }}>⚠️ ANOMALY DETECTED</p>
                                        {fraudResult.anomalies.map((a, i) => (
                                            <div key={i} style={{ background: "#fdecea", padding: "10px", borderRadius: "6px", marginBottom: "8px" }}>
                                                <p>Earlier service ({a.earlierDate}): <strong>{a.higherKm} km</strong></p>
                                                <p>Later service ({a.laterDate}): <strong>{a.lowerKm} km</strong></p>
                                                <p style={{ color: "#d32f2f" }}>Discrepancy: <strong>{a.discrepancy} km</strong></p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: "#2e7d32", fontWeight: "bold" }}>✅ No odometer anomalies detected.</p>
                                )}
                            </div>

                            {}
                            <div className="card" style={{ padding: "1.5rem" }}>
                                <h3 style={{ marginBottom: "1rem" }}><Users size={18} /> Ownership Timeline</h3>
                                {vehicleHistory.owners?.length > 0 ? (
                                    vehicleHistory.owners.map((o, i) => (
                                        <div key={i} style={{ 
                                            padding: "12px", marginBottom: "8px",
                                            borderLeft: o.status === 'current' ? '4px solid #2e7d32' : '4px solid #ccc',
                                            background: o.status === 'current' ? '#e8f5e9' : '#f9f9f9',
                                            borderRadius: "0 6px 6px 0"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <p style={{ fontWeight: "bold", margin: 0 }}>{o.owner}</p>
                                                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: o.status === 'current' ? '#2e7d32' : '#888', color: "white", fontWeight: "bold" }}>
                                                    {o.status === 'current' ? 'Current Owner' : 'Past Owner'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: "0.85rem", color: "#666", margin: "4px 0 0 0" }}>
                                                {o.from || "?"} {o.to ? ` → ${o.to}` : ' → Present'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: "#888" }}>No ownership records in graph.</p>
                                )}
                            </div>

                            {}
                            <div className="card" style={{ padding: "1.5rem" }}>
                                <h3 style={{ marginBottom: "1rem" }}>🔧 Service History</h3>
                                {vehicleHistory.services?.filter(s => s.service).length > 0 ? (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                                                <th style={{ padding: "8px" }}>Service</th>
                                                <th style={{ padding: "8px" }}>Center</th>
                                                <th style={{ padding: "8px" }}>KM</th>
                                                <th style={{ padding: "8px" }}>Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehicleHistory.services.filter(s => s.service).map((s, i) => (
                                                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                                                    <td style={{ padding: "8px" }}>{s.service}</td>
                                                    <td style={{ padding: "8px" }}>{s.center}</td>
                                                    <td style={{ padding: "8px" }}>{s.km}</td>
                                                    <td style={{ padding: "8px" }}>₹ {s.cost}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: "#888" }}>No service records in graph.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
