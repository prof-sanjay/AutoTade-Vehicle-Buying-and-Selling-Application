
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../index.css";

export default function ServiceCenters() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                console.log('Fetching service centers...');
                const response = await fetch("http://localhost:5000/api/services/centers");
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Received data:', data);
                setCenters(data);
            } catch (err) {
                console.error("Failed to fetch centers:", err);
                // You can add a user-friendly error message here
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
    }, []);

    return (
        <div className="container" style={{ marginTop: "30px" }}>
            <h2 style={{ marginBottom: "2rem", borderLeft: "5px solid var(--primary)", paddingLeft: "10px" }}>
                Authorized Service Centers
            </h2>

            {loading ? (
                <p>Loading service centers...</p>
            ) : centers.length === 0 ? (
                <div>
                    <p>No service centers found.</p>
                    <p>Please check if the backend server is running and the database has service centers.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-primary"
                        style={{ marginTop: '10px' }}
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="grid-3">
                    {centers.map(center => (
                        <div className="card" key={center.centerid} style={{ padding: "1.5rem" }}>
                            <h3>{center.centername}</h3>
                            <p style={{ margin: "0.5rem 0", color: "#666" }}>{center.address}</p>
                            <p><strong>Phone:</strong> {center.phonenumber}</p>
                            <div style={{ marginTop: "1rem" }}>
                                <span style={{ background: "#e0f7fa", color: "#006064", padding: "4px 8px", borderRadius: "5px" }}>
                                    Rating: {center.averagerating} ★
                                </span>
                            </div>
                            <Link
                                to={`/services/book?centerid=${center.centerid}&name=${encodeURIComponent(center.centername)}`}
                                className="btn btn-primary"
                                style={{ display: "block", textAlign: "center", marginTop: "1.5rem" }}
                            >
                                Book Service
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
