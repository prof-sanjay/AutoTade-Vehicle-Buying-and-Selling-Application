import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

export default function PostPurchaseRecs() {
    const { partId } = useParams();
    const navigate = useNavigate();
    const [originalPart, setOriginalPart] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        window.scrollTo(0, 0);

        
        fetch(`http://localhost:5000/api/parts/${partId}`)
            .then(res => res.json())
            .then(data => setOriginalPart(data))
            .catch(console.error);

        
        fetch(`http://localhost:5000/api/recommendations/frequently-bought/${partId}`)
            .then(res => res.json())
            .then(data => {
                if (data.recommendations) {
                    setRecommendations(data.recommendations);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [partId]);

    const handleViewPart = (id) => navigate(`/verify/part/${id}`);

    if (loading) return (
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <div className="loader"></div>
            <h2 style={{ marginLeft: "20px", color: "var(--primary)" }}>Gathering smart recommendations...</h2>
        </div>
    );

    return (
        <div className="post-purchase-bg" style={{ minHeight: "100vh", padding: "40px 20px" }}>
            <div className="container" style={{ maxWidth: "1000px" }}>
                
                {}
                <div style={{ 
                    textAlign: "center", 
                    marginBottom: "60px",
                    animation: "slideDown 0.8s ease-out"
                }}>
                    <div style={{ 
                        width: "100px", 
                        height: "100px", 
                        background: "rgba(76, 175, 80, 0.1)", 
                        borderRadius: "50%", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        border: "2px solid #4CAF50"
                    }}>
                        <span style={{ fontSize: "3rem" }}>✅</span>
                    </div>
                    <h1 style={{ 
                        fontSize: "3.5rem", 
                        fontWeight: "900", 
                        background: "linear-gradient(45deg, #1a237e, #0d47a1)", 
                        WebkitBackgroundClip: "text", 
                        WebkitTextFillColor: "transparent",
                        marginBottom: "10px" 
                    }}>
                        Order Confirmed!
                    </h1>
                    <p style={{ fontSize: "1.4rem", color: "#555" }}>
                        Your <strong>{originalPart?.partname}</strong> is on its way.
                    </p>
                </div>

                {}
                <div style={{ 
                    background: "rgba(255, 255, 255, 0.7)", 
                    backdropFilter: "blur(20px)",
                    padding: "60px 40px", 
                    borderRadius: "30px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                    animation: "fadeIn 1.2s ease-in-out"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "2.2rem", color: "#1a237e", fontWeight: "800" }}>
                            Frequently Bought Together
                        </h2>
                        <span style={{ 
                            background: "var(--primary)", 
                            color: "#fff", 
                            padding: "6px 20px", 
                            borderRadius: "50px", 
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            letterSpacing: "1px",
                            textTransform: "uppercase"
                        }}>
                            Smart Suggestions
                        </span>
                    </div>

                    {recommendations.length > 0 ? (
                        <div className="grid-3" style={{ gap: "30px" }}>
                            {recommendations.map((rec, index) => (
                                <div 
                                    key={rec.id} 
                                    className="recommendation-card"
                                    style={{ 
                                        animationDelay: `${index * 0.15}s`,
                                        background: "#fff",
                                        borderRadius: "20px",
                                        padding: "25px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                        border: "1px solid #f0f0f0",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                >
                                    {}
                                    {rec.strength > 1 && (
                                        <div style={{ 
                                            position: "absolute", 
                                            top: "15px", 
                                            right: "-30px", 
                                            background: "#ff5722", 
                                            color: "#fff", 
                                            transform: "rotate(45deg)", 
                                            padding: "4px 40px", 
                                            fontSize: "0.7rem",
                                            fontWeight: "bold",
                                            boxShadow: "0 2px 10px rgba(255,87,34,0.3)"
                                        }}>
                                            POPULAR
                                        </div>
                                    )}

                                    <div>
                                        <div style={{ 
                                            width: "100%", 
                                            height: "120px", 
                                            background: "#f8f9fa", 
                                            borderRadius: "15px", 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "center",
                                            marginBottom: "20px",
                                            fontSize: "2.5rem"
                                        }}>
                                            ⚙️
                                        </div>
                                        <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "8px", color: "#333" }}>{rec.name}</h3>
                                        <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: "1.5" }}>
                                            Essential add-on highly rated by parts enthusiasts.
                                        </p>
                                    </div>

                                    <div style={{ marginTop: "25px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ 
                                                width: "100%", 
                                                borderRadius: "12px", 
                                                padding: "12px", 
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px"
                                            }}
                                            onClick={() => handleViewPart(rec.id)}
                                        >
                                            Explore Part <span>→</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: "center", 
                            padding: "60px 20px", 
                            background: "rgba(255, 255, 255, 0.5)", 
                            borderRadius: "20px", 
                            border: "1px dashed #ced4da" 
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📦</div>
                            <h3 style={{ color: "#6c757d", marginBottom: "15px" }}>No related parts found just yet.</h3>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => navigate("/parts")}
                                style={{ borderRadius: "50px", padding: "10px 30px" }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>

                {}
                <div style={{ 
                    marginTop: "60px", 
                    textAlign: "center", 
                    color: "rgba(0,0,0,0.4)", 
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px"
                }}>
                    <div style={{ width: "20px", height: "1px", background: "rgba(0,0,0,0.1)" }}></div>
                    POWRED BY AUTOTRADE GRAPH INTELLIGENCE
                    <div style={{ width: "20px", height: "1px", background: "rgba(0,0,0,0.1)" }}></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slideDown {
                    from { transform: translateY(-30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .post-purchase-bg {
                    background: radial-gradient(circle at top right, #e3f2fd 0%, #ffffff 50%, #fff3e0 100%);
                }
                .recommendation-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 35px rgba(29, 78, 216, 0.15) !important;
                    border-color: var(--primary) !important;
                }
                .loader {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid var(--primary);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
}
