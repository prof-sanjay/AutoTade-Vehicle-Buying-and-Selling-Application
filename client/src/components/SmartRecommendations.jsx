import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../index.css";

const SmartRecommendations = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const [recommendations, setRecommendations] = useState({ compatible: [], collaborative: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        fetch(`http://localhost:5000/api/recommendations/${user.id}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.status === "success") {
                    setRecommendations(res.data);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch recommendations", err);
                setLoading(false);
            });
    }, [user?.id]);

    if (!user || loading) return null;

    if (recommendations.compatible.length === 0 && recommendations.collaborative.length === 0) {
        return null; 
    }

    return (
        <div className="container" style={{ margin: "4rem auto" }}>
            <h2
                style={{
                    fontSize: "2rem",
                    marginBottom: "2rem",
                    borderLeft: "5px solid var(--primary)",
                    paddingLeft: "10px",
                }}
            >
                Recommended for You
                <small style={{ display: "block", fontSize: "1rem", color: "#666", fontWeight: "normal", marginTop: "5px" }}>
                    Powered by Neo4j Graph Engine
                </small>
            </h2>

            {}
            {recommendations.compatible.length > 0 && (
                <div style={{ marginBottom: "3rem" }}>
                    <h3 style={{ marginBottom: "1.5rem", color: "#444" }}>Fits Your Owned Vehicles</h3>
                    <div className="grid-3">
                        {recommendations.compatible.map((item) => (
                            <RecommendationCard key={item.id} item={item} type="Compatible" />
                        ))}
                    </div>
                </div>
            )}

            {}
            {recommendations.collaborative.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: "1.5rem", color: "#444" }}>Customers with similar taste also bought</h3>
                    <div className="grid-3">
                        {recommendations.collaborative.map((item) => (
                            <RecommendationCard key={item.id} item={item} type="People Also Bought" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const RecommendationCard = ({ item, type }) => {
    return (
        <div className="card" style={{ border: "1px solid #e0e0e0" }}>
            <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{item.name}</h4>
                    <span 
                        style={{ 
                            fontSize: "0.7rem", 
                            background: type === "Compatible" ? "#e8f5e9" : "#e3f2fd", 
                            color: type === "Compatible" ? "#2e7d32" : "#1565c0",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontWeight: "bold"
                        }}
                    >
                        {type}
                    </span>
                </div>
                <p style={{ color: "var(--text-light)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    Category: {item.category}
                </p>
                <Link 
                    to={`/parts`} 
                    className="btn btn-outline" 
                    style={{ width: "100%", textAlign: "center", padding: "8px", fontSize: "0.9rem" }}
                >
                    View Product
                </Link>
            </div>
        </div>
    );
};

export default SmartRecommendations;
