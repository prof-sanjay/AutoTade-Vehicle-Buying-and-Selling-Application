import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const API = "http://localhost:5000";

export default function Parts() {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);        // part being purchased
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API}/api/parts`)
            .then(res => res.json())
            .then(data => { setParts(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    function openBuyModal(part) {
        if (!user) { navigate("/login"); return; }
        setPaymentMode("Cash");
        setBuying(part);
    }

    async function confirmPurchase() {
        if (!buying) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API}/api/parts/buy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    buyer_userid: user.id,
                    partid: buying.partid,
                    centerid: buying.centerid,
                    paymentmode: paymentMode,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Purchase failed");
            const boughtId = buying.partid;
            setBuying(null);
            navigate(`/recommendations/part/${boughtId}`);
        } catch (err) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    }

    const filtered = parts.filter(p =>
        !search || p.partname?.toLowerCase().includes(search.toLowerCase()) ||
        p.partnumber?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ background: "var(--background)", minHeight: "100vh" }}>

            {/* Header */}
            <div style={{ background: "var(--secondary)", color: "white", padding: "1.5rem 0" }}>
                <div className="container">
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Auto Parts</h1>
                    <p style={{ color: "#aaa", marginTop: "4px" }}>Genuine parts from certified service centers</p>
                </div>
            </div>

            <div className="container" style={{ marginTop: "2rem" }}>

                {/* Search + count bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
                    <p style={{ color: "var(--text-light)" }}>
                        {!loading && <><strong style={{ color: "var(--text-main)" }}>{filtered.length}</strong> parts available</>}
                    </p>
                    <input
                        placeholder="Search by name or part number..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ maxWidth: "320px", padding: "10px 14px" }}
                    />
                </div>

                {loading ? (
                    <div className="grid-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ background: "#e8e8e8", borderRadius: "var(--radius)", height: "200px" }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔩</div>
                        <h3>No parts found</h3>
                        {search && <button onClick={() => setSearch("")} className="btn btn-outline" style={{ marginTop: "1rem" }}>Clear Search</button>}
                    </div>
                ) : (
                    <div className="grid-3">
                        {filtered.map(part => (
                            <div className="card" key={part.partid}>
                                {/* Card header accent */}
                                <div style={{ height: "6px", background: "var(--primary)" }} />
                                <div style={{ padding: "1.25rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "4px" }}>{part.partname}</h3>
                                            <p style={{ color: "var(--text-light)", fontSize: "0.82rem" }}>Part #: {part.partnumber || "—"}</p>
                                        </div>
                                        <span style={{
                                            background: "#e8f5e9", color: "#2e7d32",
                                            padding: "3px 10px", borderRadius: "20px",
                                            fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap"
                                        }}>
                                            In Stock
                                        </span>
                                    </div>

                                    {part.centername && (
                                        <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "0.75rem" }}>
                                            🏪 {part.centername}
                                            {part.address && <span style={{ color: "#bbb" }}> · {part.address}</span>}
                                        </p>
                                    )}

                                    <div style={{ borderTop: "1px solid #eee", paddingTop: "0.75rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.3rem" }}>
                                            ₹ {Number(part.partprice).toLocaleString("en-IN")}
                                        </p>
                                        {user ? (
                                            <button
                                                onClick={() => openBuyModal(part)}
                                                className="btn btn-primary"
                                                style={{ padding: "8px 18px", fontSize: "0.9rem" }}
                                            >
                                                Buy Now
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate("/login")}
                                                className="btn btn-outline"
                                                style={{ padding: "8px 18px", fontSize: "0.9rem" }}
                                            >
                                                Login to Buy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── BUY MODAL ── */}
            {buying && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000, padding: "1rem"
                }}
                    onClick={e => { if (e.target === e.currentTarget) setBuying(null); }}
                >
                    <div style={{ background: "white", borderRadius: "var(--radius)", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
                        {/* Modal header */}
                        <div style={{ background: "var(--primary)", color: "white", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontWeight: 700 }}>Confirm Purchase</h3>
                            <button onClick={() => setBuying(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1 }}>×</button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: "1.5rem" }}>
                            <div style={{ background: "#f9f9f9", borderRadius: "8px", padding: "1rem", marginBottom: "1.25rem" }}>
                                <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: "4px" }}>{buying.partname}</p>
                                {buying.partnumber && <p style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Part # {buying.partnumber}</p>}
                                {buying.centername && <p style={{ color: "var(--text-light)", fontSize: "0.85rem", marginTop: "4px" }}>From: {buying.centername}</p>}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                                <span style={{ color: "var(--text-light)" }}>Total Amount</span>
                                <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.4rem" }}>
                                    ₹ {Number(buying.partprice).toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="form-group">
                                <label>Payment Mode</label>
                                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                    <option value="NetBanking">Net Banking</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
                                <button
                                    onClick={() => setBuying(null)}
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPurchase}
                                    className="btn btn-primary"
                                    style={{ flex: 2 }}
                                    disabled={processing}
                                >
                                    {processing ? "Placing Order..." : "Confirm & Place Order"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
