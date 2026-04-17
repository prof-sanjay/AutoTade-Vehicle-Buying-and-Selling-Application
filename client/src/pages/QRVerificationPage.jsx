import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../index.css";

export default function QRVerificationPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        
        
        if (!token || token === "vehicles" || token === "part") return;

        fetch(`http://localhost:5000/api/orders/verify/${token}`)
            .then(res => res.json().then(j => ({ status: res.status, body: j })))
            .then(({ status, body }) => {
                if (status === 200) {
                    setData(body);
                } else {
                    setError(body.error || "Failed to verify cryptograph token.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Network HTTP breakdown resolving token.");
                setLoading(false);
            });
    }, [token, user, navigate]);

    const handleConfirm = async () => {
        if (!window.confirm("Are you positively sure you wish to securely confirm this deal? This seals the transaction definitively within the database!")) return;
        setConfirming(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/confirm/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId: Number(user.id) })
            });
            const body = await res.json();
            if (res.ok) {
                alert("Deal Verified & Finalized! Vehicle Status: 🔒 SOLD");
                navigate("/seller-dashboard");
            } else {
                alert(body.error || "Failed payload processing deal");
            }
        } catch (err) {
            console.error(err);
            alert("Network Error executing cryptograph action");
        }
        setConfirming(false);
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to explicitly CANCEL this deal? This cannot be undone.")) return;
        setConfirming(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId: Number(user.id), orderId: data.orderid })
            });
            const body = await res.json();
            if (res.ok) {
                alert("Deal strictly Cancelled. Vehicle is returned as available in the market.");
                navigate("/seller-dashboard");
            } else {
                alert(body.error || "Failed payload cancelling deal");
            }
        } catch (err) {
            console.error(err);
            alert("Network Error executing cancel action");
        }
        setConfirming(false);
    };

    if (loading) return <div className="container" style={{ margin: "40px auto", textAlign: "center" }}><h2>Validating Secure Handshake...</h2></div>;

    if (error) {
        return (
            <div className="container" style={{ margin: "40px auto", maxWidth: "600px", textAlign: "center" }}>
                <div style={{ padding: "3rem", background: "#ffebee", color: "#c62828", borderRadius: "12px", border: "1px solid #ef9a9a" }}>
                    <h2 style={{ fontSize: "2rem" }}>Verification Failed</h2>
                    <p style={{ fontSize: "1.2rem", margin: "1.5rem 0" }}>{error}</p>
                    <Link to="/orders" className="btn btn-outline" style={{ padding: "10px 20px" }}>Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const isSeller = Number(user.id) === Number(data.seller_userid);
    const isBuyer = Number(user.id) === Number(data.buyer_userid);

    if (!isSeller && !isBuyer) {
        return (
            <div className="container" style={{ margin: "40px auto", maxWidth: "600px", textAlign: "center" }}>
                <div style={{ padding: "3rem", background: "#333", color: "#fff", borderRadius: "12px", border: "2px solid #000" }}>
                    <h2 style={{ fontSize: "2rem", color: "#f44336" }}>Unauthorized Access</h2>
                    <p style={{ fontSize: "1.2rem", margin: "1.5rem 0" }}>You are not a verified participant in this transaction block!</p>
                    <Link to="/home" className="btn btn-outline" style={{ padding: "10px 20px", color: "white", borderColor: "white" }}>Return to Safety</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ margin: "40px auto", maxWidth: "800px" }}>
            <h2 style={{ marginBottom: "2rem", borderBottom: "3px solid #eee", paddingBottom: "10px", fontSize: "2.3rem" }}>Secure Deal Verification</h2>
            
            <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
                <h3 style={{ color: "var(--primary)", marginBottom: "1.2rem" }}>Vehicle Overview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", fontSize: "1.1rem" }}>
                    <div><strong>Model:</strong> {data.model}</div>
                    <div><strong>Registration:</strong> {data.vehicleregistration}</div>
                    <div><strong>Agreed Price:</strong> ₹ {Number(data.price).toLocaleString()}</div>
                    <div><strong>Specs:</strong> {data.fueltype} ({data.kmdriven} KM)</div>
                </div>
            </div>

            <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
                <h3 style={{ color: "#2e7d32", marginBottom: "1.2rem" }}>Buyer Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", fontSize: "1.1rem" }}>
                    <div><strong>Purchaser:</strong> {data.buyername}</div>
                    <div><strong>Contact:</strong> {data.buyercontact}</div>
                </div>
            </div>

            <div className="card" style={{ padding: "2rem", marginBottom: "2rem", background: "#f8f9fa", borderLeft: "5px solid #1976d2" }}>
                <h3 style={{ marginBottom: "1.2rem" }}>Transaction Metadata</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", fontSize: "1.1rem" }}>
                    <div><strong>Order Element ID:</strong> #{data.orderid}</div>
                    <div><strong style={{ color: "#d32f2f" }}>Token Expires:</strong> {new Date(data.token_expiry).toLocaleString()}</div>
                    <div><strong>Placed On:</strong> {new Date(data.orderdate).toLocaleDateString()}</div>
                    <div>
                        <strong>Lock Status:</strong> 
                        <span style={{ marginLeft: "10px", padding: "6px 12px", background: "#ffe0b2", color: "#e65100", borderRadius: "5px", fontWeight: "bold" }}>{data.status}</span>
                    </div>
                </div>
            </div>
            
            {isSeller ? (
                <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                    <button 
                        onClick={handleConfirm} 
                        disabled={confirming}
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: "1.3rem", fontSize: "1.2rem", fontWeight: "bold", background: "#2e7d32", border: "none" }}
                    >
                        {confirming ? "Processing..." : "Confirm Deal & Finalize"}
                    </button>
                    <button 
                        onClick={handleCancel} 
                        disabled={confirming}
                        className="btn btn-danger" 
                        style={{ flex: 1, padding: "1.3rem", fontSize: "1.2rem", fontWeight: "bold", background: "#d32f2f", color: "white", border: "none" }}
                    >
                        {confirming ? "Processing..." : "Cancel Deal"}
                    </button>
                </div>
            ) : (
                <div style={{ padding: "2rem", background: "#e3f2fd", color: "#1565c0", textAlign: "center", borderRadius: "10px", border: "1px solid #90caf9" }}>
                    <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "10px" }}>Active View: Buyer Generation Node</p>
                    <p style={{ fontSize: "1.1rem" }}>Please securely present to the <strong>Seller</strong> so they will be able to scan and confirm!</p>
                </div>
            )}
            
        </div>
    );
}
