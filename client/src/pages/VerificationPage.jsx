import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../index.css";

export default function Verification() {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const itemId = location.pathname.split("/").pop();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        fetch(`http://localhost:5000/api/vehicles/${itemId}`)
            .then(res => res.json())
            .then(data => {
                setItem(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [itemId, navigate, user]);

    const handleNotifySeller = async () => {
        try {
            const payload = {
                itemId: item.vehicleid,        // 🔥 THIS is itemId
                buyerId: user.details.userid,  // 🔥 buyer.userid
                sellerId: item.seller_userid,       // 🔥 vehicles.sellerid
                amount: item.price
            };

            console.log("Notify payload:", payload);

            const response = await fetch(
                "http://localhost:5000/api/orders/notify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Notify failed");
            }

            alert("Seller notified successfully!");
            navigate("/orders");

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!item) return <div className="container">Vehicle not found</div>;

    return (
        <div className="container" style={{ marginTop: "40px", maxWidth: "700px" }}>
            <div className="card" style={{ padding: "30px" }}>
                <h2>Vehicle Details</h2>

                <h3>{item.model}</h3>
                <h2>₹{item.price}</h2>

                <p><strong>Seller:</strong> {item.sellername}</p>
                <p><strong>Phone:</strong> {item.sellerphone}</p>

                <div style={{ marginTop: "20px" }}>
                    <button
                        className="btn"
                        onClick={() => navigate("/vehicles")}
                        style={{ marginRight: "10px" }}
                    >
                        Back
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleNotifySeller}
                    >
                        Notify Seller
                    </button>
                </div>
            </div>
        </div>
    );
}

