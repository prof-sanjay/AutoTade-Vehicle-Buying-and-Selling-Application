import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

export default function SellerDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        fetch(`http://localhost:5000/api/vehicles/my-vehicles/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setVehicles(data);
                } else {
                    console.error("Invalid data", data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch vehicles", err);
                setLoading(false);
            });
    }, [user, navigate]);

    if (!user) return null;

    const soldVehicles = vehicles.filter(v => v.status === "Sold");
    const activeVehicles = vehicles.filter(v => v.status !== "Sold");

    return (
        <div className="container" style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>My Listings</h2>
                <Link to="/add-vehicle" className="btn btn-primary">Add New Vehicle</Link>
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    <h3 style={{ borderBottom: "2px solid #ddd", paddingBottom: "10px", marginBottom: "15px" }}>Active Listings</h3>
                    {activeVehicles.length > 0 ? (
                        <div className="grid-3">
                            {activeVehicles.map(car => (
                                <div key={car.vehicleid} className="card">
                                    <div
                                        style={{
                                            height: "200px",
                                            background: car.previewImage ? `url(http://localhost:5000${car.previewImage}) center/cover` : "#ddd",
                                            position: "relative"
                                        }}
                                    >
                                        <div style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            background: "rgba(0,0,0,0.7)",
                                            color: "white",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "0.8rem"
                                        }}>
                                            {car.status || "Available"}
                                        </div>
                                    </div>
                                    <div style={{ padding: "1rem" }}>
                                        <h3>{car.model}</h3>
                                        <p style={{ color: "var(--primary)", fontWeight: "bold" }}>
                                            ₹ {Number(car.price).toLocaleString()}
                                        </p>
                                        <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                            {car.vehicleregistration}
                                        </p>
                                        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                            <Link to={`/vehicle/${car.vehicleid}`} className="btn btn-outline" style={{ flex: 1, textAlign: "center", fontSize: "0.9rem", padding: "8px" }}>
                                                View
                                            </Link>
                                            {/* Could add edit/delete buttons here */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#777", fontStyle: "italic" }}>No active listings found.</p>
                    )}

                    <h3 style={{ borderBottom: "2px solid #ddd", paddingBottom: "10px", marginBottom: "15px", marginTop: "40px" }}>Sold History</h3>
                    {soldVehicles.length > 0 ? (
                        <div className="grid-3">
                            {soldVehicles.map(car => (
                                <div key={car.vehicleid} className="card" style={{ opacity: 0.8 }}>
                                    <div
                                        style={{
                                            height: "200px",
                                            background: car.previewImage ? `url(http://localhost:5000${car.previewImage}) center/cover` : "#ddd",
                                            position: "relative"
                                        }}
                                    >
                                        <div style={{
                                            position: "absolute",
                                            top: "0",
                                            left: "0",
                                            width: "100%",
                                            height: "100%",
                                            background: "rgba(0,0,0,0.5)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "1.5rem",
                                            letterSpacing: "2px"
                                        }}>
                                            SOLD
                                        </div>
                                    </div>
                                    <div style={{ padding: "1rem" }}>
                                        <h3>{car.model}</h3>
                                        <p style={{ color: "#666", fontWeight: "bold", textDecoration: "line-through" }}>
                                            ₹ {Number(car.price).toLocaleString()}
                                        </p>
                                        <p style={{ fontSize: "0.9rem", color: "#666" }}>
                                            Sold on: {car.sold_date ? new Date(car.sold_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                        <Link to={`/vehicle/${car.vehicleid}`} className="btn btn-outline" style={{ width: "100%", marginTop: "10px", textAlign: "center" }}>
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#777", fontStyle: "italic" }}>No vehicles sold yet.</p>
                    )}
                </>
            )}
        </div>
    );
}
