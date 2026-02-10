import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

export default function VehicleDetails() {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:5000/api/vehicles/${id}`)
            .then(res => res.json())
            .then(data => setVehicle(data));
    }, [id]);

    function handleBuy() {
        if (!user) {
            navigate("/login");
            return;
        }
        // Navigate to verification page
        navigate(`/verify/vehicle/${id}`);
    }

    if (!vehicle) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{ margin: "2rem auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>

                {/* Left: Images */}
                <div>
                    <img
                        src={vehicle.images?.[0]?.ImagePath || "https://placehold.co/800x600?text=Vehicle+Image"}
                        style={{ width: "100%", borderRadius: "var(--radius)" }}
                    />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "10px",
                            marginTop: "1rem"
                        }}
                    >
                        {vehicle.images?.slice(1).map(img => (
                            <img
                                key={img.ImageID}
                                src={img.ImagePath}
                                style={{ width: "100%", borderRadius: "var(--radius)" }}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div>
                    <h1 style={{ fontSize: "2.5rem" }}>{vehicle.model}</h1>
                    <h2 style={{ color: "var(--primary)", fontSize: "2rem", margin: "1rem 0" }}>
                        ₹ {vehicle.price}
                    </h2>

                    <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                        <h3>Specifications</h3>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "1rem",
                                marginTop: "1rem"
                            }}
                        >
                            <div><strong>Year:</strong> {vehicle.dateofmanufacture}</div>
                            <div><strong>KM Driven:</strong> {vehicle.kmdriven}</div>
                            <div><strong>Fuel:</strong> {vehicle.fueltype}</div>
                            <div><strong>Transmission:</strong> {vehicle.transmission}</div>
                            <div><strong>Engine:</strong> {vehicle.engine}</div>
                            <div><strong>Color:</strong> {vehicle.color}</div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                        <h3>Seller Details</h3>
                        <div style={{ marginTop: "1rem" }}>
                            <p><strong>Name:</strong> {vehicle.sellername || "Unknown"}</p>
                            <p><strong>Phone:</strong> {vehicle.sellerphone || "N/A"}</p>
                            {vehicle.selleremail && <p><strong>Email:</strong> {vehicle.selleremail}</p>}
                        </div>
                    </div>

                    {/* Fitness Certificate */}
                    {vehicle.fc_id && (
                        <div
                            className="card"
                            style={{
                                padding: "1.5rem",
                                marginBottom: "2rem",
                                borderLeft: "5px solid var(--primary)"
                            }}
                        >
                            <h3>Fitness Certificate</h3>
                            <div style={{ marginTop: "1rem" }}>
                                <p>
                                    <strong>Status:</strong>{" "}
                                    <span
                                        style={{
                                            color: vehicle.fc_status === "Valid" ? "green" : "red",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        {vehicle.fc_status}
                                    </span>
                                </p>
                                <p><strong>Issued:</strong> {new Date(vehicle.issuedate).toLocaleDateString()}</p>
                                <p><strong>Expires:</strong> {new Date(vehicle.expirydate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}

                    {user && user.id !== vehicle.seller_userid && (
                        <button
                            onClick={handleBuy}
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "1rem", fontSize: "1.2rem" }}
                        >
                            Buy Now
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
