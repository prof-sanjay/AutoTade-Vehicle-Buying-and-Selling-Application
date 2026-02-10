
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Parts() {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/api/parts")
            .then(res => res.json())
            .then(data => {
                setParts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch parts", err);
                setLoading(false);
            });
    }, []);

    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    function handleBuyPart(part) {
        if (!user) {
            navigate("/login");
            return;
        }
        // Navigate to verification page for the part
        navigate(`/verify/part${part.partid}`);
    }

    return (
        <div className="container" style={{ marginTop: "30px" }}>
            <h2 style={{ marginBottom: "2rem", borderLeft: "5px solid var(--primary)", paddingLeft: "10px" }}>
                Auto Parts
            </h2>

            {loading ? <p>Loading parts...</p> : (
                <div className="grid-3">
                    {parts.map(part => (
                        <div className="card" key={part.partid} style={{ padding: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <h3 style={{ marginBottom: "0.5rem" }}>{part.partname}</h3>
                                    <p style={{ color: "#666", fontSize: "0.9rem" }}>Part #: {part.partnumber}</p>
                                    {part.centername && (
                                        <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "5px" }}>
                                            Sold by: {part.centername}
                                        </p>
                                    )}
                                </div>
                                <span style={{
                                    background: "#f0f0f0",
                                    padding: "5px 10px",
                                    borderRadius: "15px",
                                    fontSize: "0.8rem",
                                    fontWeight: "bold"
                                }}>
                                    In Stock
                                </span>
                            </div>

                            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
                                <p style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1rem" }}>
                                    ₹ {Number(part.partprice).toLocaleString()}
                                </p>
                                {user && user.role === 'user' && ( // Parts are bought by regular users
                                    <button
                                        onClick={() => handleBuyPart(part)}
                                        className="btn btn-primary"
                                        style={{ width: "100%", padding: "10px" }}
                                    >
                                        Buy Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {parts.length === 0 && <p>No parts available.</p>}
                </div>
            )}
        </div>
    );
}
