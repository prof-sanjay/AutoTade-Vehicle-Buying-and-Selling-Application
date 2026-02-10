import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [isUnified, setIsUnified] = useState(false);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        fetch(`http://localhost:5000/api/orders/my-orders/${user.id}?role=${user.role}`)
            .then(res => res.json())
            .then(data => {
                if (data.isUnified) {
                    setPurchases(data.purchases);
                    setSales(data.sales);
                    setIsUnified(true);
                } else {
                    setOrders(data);
                    setIsUnified(false);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch orders", err);
                setLoading(false);
            });
    }, [user, navigate]);

    function handleVerifyPayment(orderId) {
        if (!window.confirm("Confirm payment receipt?")) return;

        fetch("http://localhost:5000/api/orders/verify-payment", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    alert("Payment Verified");
                    const updateOrder = (o) => o.orderid === orderId ? { ...o, paymentstatus: "Completed", order_status: "Completed" } : o;

                    if (isUnified) {
                        setSales(prev => prev.map(updateOrder));
                    } else {
                        setOrders(prev => prev.map(updateOrder));
                    }
                }
            });
    }

    if (!user) return null;

    const OrderTable = ({ data, type }) => (
        <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
            {data.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                    <thead>
                        <tr style={{ background: "var(--primary)", color: "white" }}>
                            <th style={{ padding: "12px" }}>Order ID</th>
                            <th style={{ padding: "12px" }}>Date</th>
                            <th style={{ padding: "12px" }}>Vehicle</th>
                            <th style={{ padding: "12px" }}>Registration</th>
                            {type === 'purchase' && <th style={{ padding: "12px" }}>Seller</th>}
                            {type === 'sale' && (
                                <>
                                    <th style={{ padding: "12px" }}>Buyer Name</th>
                                    <th style={{ padding: "12px" }}>Buyer Phone</th>
                                </>
                            )}
                            <th style={{ padding: "12px", textAlign: "left" }}>Price</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                            {type === 'sale' && <th style={{ padding: "12px" }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(order => (
                            <tr key={order.orderid} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "12px" }}>#{order.orderid}</td>
                                <td style={{ padding: "12px" }}>{new Date(order.orderdate).toLocaleDateString()}</td>
                                <td style={{ padding: "12px", fontWeight: "bold" }}>{order.model}</td>
                                <td style={{ padding: "12px" }}>{order.vehicleregistration}</td>
                                {type === 'purchase' && (
                                    <td style={{ padding: "12px" }}>
                                        {order.sellername || 'N/A'} <br />
                                        <small>{order.sellerphone}</small>
                                    </td>
                                )}
                                {type === 'sale' && (
                                    <>
                                        <td style={{ padding: "12px" }}>{order.buyername}</td>
                                        <td style={{ padding: "12px" }}>{order.buyerphone}</td>
                                    </>
                                )}
                                <td style={{ padding: "12px" }}>₹ {Number(order.price).toLocaleString()}</td>
                                <td style={{ padding: "12px" }}>
                                    <span style={{
                                        padding: "4px 12px", borderRadius: "12px", fontWeight: "500", fontSize: "0.85rem", display: "inline-block", minWidth: "90px", textAlign: "center",
                                        ...(order.order_status === 'Notified' ? { background: '#fff3e6', color: '#e65100', border: '1px solid #ffe0b2' } :
                                            order.order_status === 'Completed' ? { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' } :
                                                { background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb' })
                                    }}>
                                        {order.order_status || 'Pending'}
                                    </span>
                                </td>
                                {type === 'sale' && (
                                    <td style={{ padding: "12px" }}>
                                        {order.paymentstatus !== "Completed" && (
                                            <button onClick={() => handleVerifyPayment(order.orderid)} className="btn btn-primary" style={{ padding: "5px 10px", fontSize: "0.8rem" }}>
                                                Payment Received
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p>No orders found.</p>}
        </div>
    );

    return (
        <div className="container" style={{ marginTop: "30px" }}>
            <h2 style={{ marginBottom: "20px" }}>My Activity</h2>

            {loading ? <p>Loading...</p> : (
                <>
                    {isUnified ? (
                        <>
                            <h3>My Purchases</h3>
                            <OrderTable data={purchases} type="purchase" />

                            <h3>My Sales</h3>
                            <OrderTable data={sales} type="sale" />
                        </>
                    ) : (
                        <OrderTable data={orders} type={user.role === 'buyer' ? 'purchase' : 'sale'} />
                    )}
                </>
            )}
        </div>
    );
}
