import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const API = "http://localhost:5000";

const STATUS_STYLE = {
    Notified:  { background: "#fff3e6", color: "#e65100", border: "1px solid #ffe0b2" },
    Completed: { background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9" },
    Pending:   { background: "#e3f2fd", color: "#1565c0", border: "1px solid #bbdefb" },
    Cancelled: { background: "#fce4ec", color: "#c62828", border: "1px solid #f8bbd0" },
};

function StatusBadge({ status }) {
    const s = status || "Pending";
    const style = STATUS_STYLE[s] || STATUS_STYLE.Pending;
    return (
        <span style={{
            ...style, padding: "4px 12px", borderRadius: "12px",
            fontWeight: 500, fontSize: "0.82rem", display: "inline-block",
            minWidth: "90px", textAlign: "center"
        }}>
            {s}
        </span>
    );
}

export default function Orders() {
    const navigate = useNavigate();
    const [user] = useState(() => JSON.parse(localStorage.getItem("user")));

    const [tab, setTab] = useState("purchases");
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [partOrders, setPartOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }

        setLoading(true);

        let vehiclePurchases = [], vehicleSales = [], parts = [];

        const vehicleReq = fetch(`${API}/api/orders/my-orders/${user.id}`)
            .then(r => r.json())
            .then(data => {
                vehiclePurchases = Array.isArray(data.purchases) ? data.purchases : [];
                vehicleSales     = Array.isArray(data.sales)     ? data.sales     : [];
                setPurchases(vehiclePurchases);
                setSales(vehicleSales);
            })
            .catch(() => { setPurchases([]); setSales([]); });

        const partReq = fetch(`${API}/api/parts/my-orders/${user.id}`)
            .then(r => r.json())
            .then(data => {
                parts = Array.isArray(data) ? data : [];
                setPartOrders(parts);
            })
            .catch(() => setPartOrders([]));

        Promise.all([vehicleReq, partReq]).then(() => {
            // Auto-switch to Part Orders tab if user has part orders but no vehicle purchases
            if (parts.length > 0 && vehiclePurchases.length === 0 && vehicleSales.length === 0) {
                setTab("parts");
            }
        }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleVerifyPayment(orderId) {
        if (!window.confirm("Confirm you received the payment?")) return;
        fetch(`${API}/api/orders/verify-payment`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.message) {
                    setSales(prev => prev.map(o =>
                        o.orderid === orderId
                            ? { ...o, paymentstatus: "Completed", order_status: "Completed" }
                            : o
                    ));
                }
            });
    }

    if (!user) return null;

    const tabs = [
        { key: "purchases", label: "My Purchases", count: purchases.length },
        { key: "sales",     label: "My Sales",     count: sales.length },
        { key: "parts",     label: "Part Orders",  count: partOrders.length },
    ];

    return (
        <div style={{ background: "var(--background)", minHeight: "100vh" }}>
            {/* Page header */}
            <div style={{ background: "var(--secondary)", color: "white", padding: "1.5rem 0" }}>
                <div className="container">
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Sale & Orders</h1>
                    <p style={{ color: "#aaa", marginTop: "4px" }}>Track all your vehicle and parts transactions</p>
                </div>
            </div>

            <div className="container" style={{ marginTop: "2rem" }}>
                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", borderBottom: "2px solid #e0e0e0", marginBottom: "1.5rem" }}>
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            padding: "10px 24px", border: "none", cursor: "pointer", fontWeight: 600,
                            fontSize: "0.95rem", borderRadius: "6px 6px 0 0",
                            background: tab === t.key ? "var(--primary)" : "transparent",
                            color: tab === t.key ? "white" : "var(--text-light)",
                            borderBottom: tab === t.key ? "2px solid var(--primary)" : "none",
                            transition: "all 0.2s",
                            display: "flex", alignItems: "center", gap: "8px"
                        }}>
                            {t.label}
                            <span style={{
                                background: tab === t.key ? "rgba(255,255,255,0.25)" : "#e0e0e0",
                                color: tab === t.key ? "white" : "#666",
                                borderRadius: "20px", padding: "1px 8px", fontSize: "0.78rem", fontWeight: 700
                            }}>
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-light)" }}>
                        Loading orders...
                    </div>
                ) : (
                    <>
                        {tab === "purchases" && (
                            <VehicleOrderTable
                                data={purchases}
                                type="purchase"
                                onVerify={handleVerifyPayment}
                                emptyMsg="You haven't purchased any vehicles yet."
                            />
                        )}
                        {tab === "sales" && (
                            <VehicleOrderTable
                                data={sales}
                                type="sale"
                                onVerify={handleVerifyPayment}
                                emptyMsg="You haven't sold any vehicles yet."
                            />
                        )}
                        {tab === "parts" && (
                            <PartOrderTable data={partOrders} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function VehicleOrderTable({ data, type, onVerify, emptyMsg }) {
    if (data.length === 0) return <EmptyState msg={emptyMsg} />;

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
                <thead>
                    <tr style={{ background: "var(--primary)", color: "white" }}>
                        <Th>Order ID</Th>
                        <Th>Date</Th>
                        <Th>Vehicle</Th>
                        <Th>Reg. No.</Th>
                        {type === "purchase" && <Th>Seller</Th>}
                        {type === "sale"     && <><Th>Buyer</Th><Th>Phone</Th></>}
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        {type === "sale"     && <Th>Action</Th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map(o => (
                        <tr key={o.orderid} style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <Td><span style={{ color: "var(--primary)", fontWeight: 600 }}>#{o.orderid}</span></Td>
                            <Td>{o.orderdate ? new Date(o.orderdate).toLocaleDateString("en-IN") : "—"}</Td>
                            <Td><strong>{o.model || "—"}</strong></Td>
                            <Td style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>{o.vehicleregistration || "—"}</Td>
                            {type === "purchase" && (
                                <Td>
                                    {o.sellername || "—"}<br />
                                    <small style={{ color: "var(--text-light)" }}>{o.sellerphone}</small>
                                </Td>
                            )}
                            {type === "sale" && (
                                <>
                                    <Td>{o.buyername || "—"}</Td>
                                    <Td style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>{o.buyerphone || "—"}</Td>
                                </>
                            )}
                            <Td><strong>₹ {Number(o.price || 0).toLocaleString("en-IN")}</strong></Td>
                            <Td><StatusBadge status={o.order_status} /></Td>
                            {type === "sale" && (
                                <Td>
                                    {o.paymentstatus !== "Completed" ? (
                                        <button
                                            onClick={() => onVerify(o.orderid)}
                                            className="btn btn-primary"
                                            style={{ padding: "5px 12px", fontSize: "0.8rem" }}
                                        >
                                            Mark Paid
                                        </button>
                                    ) : (
                                        <span style={{ color: "#4caf50", fontSize: "0.85rem", fontWeight: 600 }}>✓ Paid</span>
                                    )}
                                </Td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PartOrderTable({ data }) {
    if (data.length === 0) return <EmptyState msg="You haven't ordered any parts yet." />;

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
                <thead>
                    <tr style={{ background: "var(--primary)", color: "white" }}>
                        <Th>Order ID</Th>
                        <Th>Date</Th>
                        <Th>Part Name</Th>
                        <Th>Part #</Th>
                        <Th>Service Center</Th>
                        <Th>Amount</Th>
                        <Th>Payment</Th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(o => (
                        <tr key={o.orderid} style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <Td><span style={{ color: "var(--primary)", fontWeight: 600 }}>#{o.orderid}</span></Td>
                            <Td>{o.orderdate ? new Date(o.orderdate).toLocaleDateString("en-IN") : "—"}</Td>
                            <Td><strong>{o.partname}</strong></Td>
                            <Td style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>{o.partnumber || "—"}</Td>
                            <Td>{o.centername || "—"}</Td>
                            <Td><strong>₹ {Number(o.partprice || 0).toLocaleString("en-IN")}</strong></Td>
                            <Td>
                                <StatusBadge status={o.paymentstatus === "Completed" ? "Completed" : "Pending"} />
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Th({ children }) {
    return <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.88rem" }}>{children}</th>;
}
function Td({ children, style }) {
    return <td style={{ padding: "13px 16px", fontSize: "0.9rem", ...style }}>{children}</td>;
}
function EmptyState({ msg }) {
    return (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p style={{ color: "var(--text-light)" }}>{msg}</p>
        </div>
    );
}
