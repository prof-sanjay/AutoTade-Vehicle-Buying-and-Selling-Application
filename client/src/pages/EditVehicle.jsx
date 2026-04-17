import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../index.css";

export default function EditVehicle() {
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        model: "", price: "", fueltype: "", transmission: "",
        kmdriven: "", color: "", engine: "", vehicleregistration: "",
        locationid: "1", dateofmanufacture: "", summary: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        
        fetch(`http://localhost:5000/api/vehicles/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.vehicleid) {
                    setFormData({
                        model: data.model || "",
                        price: data.price || "",
                        fueltype: data.fueltype || "",
                        transmission: data.transmission || "",
                        kmdriven: data.kmdriven || "",
                        color: data.color || "",
                        engine: data.engine || "",
                        vehicleregistration: data.vehicleregistration || "",
                        locationid: data.locationid || "1",
                        dateofmanufacture: data.dateofmanufacture ? data.dateofmanufacture.split('T')[0] : "",
                        summary: data.summary || ""
                    });
                    setLoading(false);
                } else {
                    alert("Vehicle not found");
                    navigate("/seller-dashboard");
                }
            })
            .catch(err => {
                console.error("Error fetching vehicle details:", err);
                setLoading(false);
            });
    }, [id, user?.id, navigate]);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();

        const payload = {
            ...formData,
            seller_userid: user.id
        };

        fetch(`http://localhost:5000/api/vehicles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    alert("Vehicle Updated!");
                    navigate("/seller-dashboard");
                } else {
                    const detailMsg = data.details ? `\nDetails: ${data.details}` : "";
                    alert(`${data.error || "Failed to update vehicle"}${detailMsg}`);
                }
            })
            .catch(err => {
                console.error("Error updating vehicle:", err);
                alert("Failed to update vehicle");
            });
    }

    if (loading) return <div className="container">Loading vehicle details...</div>;

    return (
        <div className="container" style={{ margin: "2rem auto", maxWidth: "800px" }}>
            <div className="card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2>Edit Vehicle Listing</h2>
                    <Link to="/seller-dashboard" className="btn btn-outline" style={{ fontSize: "0.9rem" }}>
                        Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
                    <div className="form-group"><label>Model</label><input name="model" value={formData.model} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Price (₹)</label><input name="price" type="number" value={formData.price} onChange={handleChange} required /></div>

                    <div className="form-group"><label>Fuel</label>
                        <select name="fueltype" value={formData.fueltype} onChange={handleChange} required>
                            <option value="">Select</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="form-group"><label>Transmission</label>
                        <select name="transmission" value={formData.transmission} onChange={handleChange} required>
                            <option value="">Select</option><option value="Manual">Manual</option><option value="Automatic">Automatic</option>
                        </select>
                    </div>

                    <div className="form-group"><label>KM Driven</label><input name="kmdriven" type="number" value={formData.kmdriven} onChange={handleChange} /></div>
                    <div className="form-group"><label>Color</label><input name="color" value={formData.color} onChange={handleChange} /></div>
                    <div className="form-group"><label>Engine</label><input name="engine" value={formData.engine} onChange={handleChange} /></div>
                    <div className="form-group"><label>Registration No</label><input name="vehicleregistration" value={formData.vehicleregistration} readOnly style={{ background: "#f5f5f5" }} /></div>
                    <div className="form-group"><label>Date of Mfg</label><input name="dateofmanufacture" type="date" value={formData.dateofmanufacture} onChange={handleChange} /></div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Vehicle Summary</label>
                        <textarea 
                            name="summary" 
                            value={formData.summary}
                            onChange={handleChange} 
                            rows={3}
                            placeholder="Write a brief, catchy summary for this vehicle..."
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontFamily: "inherit" }}
                        />
                    </div>

                    <button className="btn btn-primary" style={{ gridColumn: "span 2", marginTop: "1rem" }}>Save Changes</button>
                </form>
            </div>
        </div>
    );
}
