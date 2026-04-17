import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../index.css";

export default function AddVehicle() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        model: "", price: "", fueltype: "", transmission: "",
        kmdriven: "", color: "", engine: "", vehicleregistration: "",
        locationid: "1", dateofmanufacture: ""
    });
    const [images, setImages] = useState([]);

    if (!user) { 
        return <div className="container" style={{ textAlign: "center", marginTop: "2rem" }}>Please Login to Sell</div>;
    }

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        // Use user.id directly as sellerid for unified users
        

        data.append("seller_userid", user.id);

        for (let i = 0; i < images.length; i++) {

            data.append("images", images[i]);
        }

        fetch("http://localhost:5000/api/vehicles/add", {
            method: "POST",
            body: data 
        })
            .then(res => res.json())
            .then(data => {
                if (data.vehicleId) {
                    alert("Vehicle Added!");
                    navigate("/orders");
                } else {
                    alert(data.error || "Failed to add vehicle");
                }
            })
            .catch(err => {
                console.error("Error adding vehicle:", err);

                alert("Failed to add vehicle");
            });
    }

    return (
        <div className="container" style={{ margin: "2rem auto", maxWidth: "800px" }}>
            <div className="card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2>Sell a Vehicle</h2>

                    <Link to="/seller-dashboard" className="btn btn-outline" style={{ fontSize: "0.9rem" }}>
                        View Sell Status
                    </Link>

                </div>

                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
                    <div className="form-group"><label>Model</label><input name="model" onChange={handleChange} required /></div>
                    <div className="form-group"><label>Price</label><input name="price" type="number" onChange={handleChange} required /></div>

                    <div className="form-group"><label>Fuel</label>
                        <select name="fueltype" onChange={handleChange} required>
                            <option value="">Select</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option>
                        </select>

                    </div>
                    <div className="form-group"><label>Transmission</label>
                        <select name="transmission" onChange={handleChange} required>
                            <option value="">Select</option><option value="Manual">Manual</option><option value="Automatic">Automatic</option>
                        </select>

                    </div>

                    <div className="form-group"><label>KM Driven</label><input name="kmdriven" type="number" onChange={handleChange} /></div>
                    <div className="form-group"><label>Color</label><input name="color" onChange={handleChange} /></div>

                    <div className="form-group"><label>Engine</label><input name="engine" onChange={handleChange} /></div>
                    <div className="form-group"><label>Registration No</label><input name="vehicleregistration" onChange={handleChange} /></div>
                    <div className="form-group"><label>Date of Mfg</label><input name="dateofmanufacture" type="date" onChange={handleChange} /></div>

                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                        <label>Photos</label>


                        <input type="file" multiple onChange={e => setImages(e.target.files)} />
                    </div>

                    <button className="btn btn-primary" style={{ gridColumn: "span 2" }}>Submit Listing</button>
                </form>
            </div>
        </div>
    );
}

