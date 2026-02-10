import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        fetch(`http://localhost:5000/api/services/bookings/${user.id}?role=buyer`)
            .then(res => res.json())
            .then(data => {
                setBookings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch bookings", err);
                setLoading(false);
            });
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="container" style={{ marginTop: "30px" }}>
            <h2 style={{ marginBottom: "20px" }}>My Service Bookings</h2>

            {loading ? <p>Loading...</p> : (
                <div style={{ overflowX: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/services")}
                        >
                            + Book a Service
                        </button>
                    </div>

                    {bookings.length > 0 ? (
                        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                            <thead>
                                <tr style={{ background: "var(--primary)", color: "white", textAlign: "left" }}>
                                    <th style={{ padding: "12px" }}>Service</th>
                                    <th style={{ padding: "12px" }}>Service Center</th>
                                    <th style={{ padding: "12px" }}>Date</th>
                                    <th style={{ padding: "12px" }}>Time</th>
                                    <th style={{ padding: "12px" }}>Price</th>
                                    <th style={{ padding: "12px" }}>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.serviceid} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: "12px", fontWeight: "bold" }}>{b.servicename}</td>
                                        <td style={{ padding: "12px" }}>{b.centername}</td>
                                        <td style={{ padding: "12px" }}>{new Date(b.servicedate).toLocaleDateString()}</td>
                                        <td style={{ padding: "12px" }}>{b.servicetime}</td>
                                        <td style={{ padding: "12px" }}>₹ {Number(b.baseprice).toLocaleString()}</td>
                                        <td style={{ padding: "12px" }}>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                background: b.paymentstatus === 'Completed' ? '#d4edda' : '#fff3cd',
                                                color: b.paymentstatus === 'Completed' ? '#155724' : '#856404'
                                            }}>
                                                {b.paymentstatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No service bookings found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
