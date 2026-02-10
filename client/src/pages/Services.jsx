import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Services() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [vehicles, setVehicles] = useState([]);
    const [centers, setCenters] = useState([]);
    const [form, setForm] = useState({
        vehicleid: "",
        centerid: "",
        servicedate: "",
        servicetime: ""
    });

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        // Fetch user's vehicles
        fetch(`http://localhost:5000/api/vehicles/user/${user.id}`)
            .then(res => res.json())
            .then(data => setVehicles(data));

        // Fetch service centers
        fetch("http://localhost:5000/api/servicecenters")
            .then(res => res.json())
            .then(data => setCenters(data));
    }, [user, navigate]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();

        fetch("http://localhost:5000/api/services/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                buyerid: user.id,
                ...form
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Service booked successfully!");
                    navigate("/my-bookings");
                } else {
                    alert("Failed to book service");
                }
            });
    }

    return (
        <div className="container" style={{ maxWidth: "600px", marginTop: "40px" }}>
            <h2 style={{ marginBottom: "20px" }}>Book a Vehicle Service</h2>

            <form onSubmit={handleSubmit} className="card" style={{ padding: "20px" }}>

                <div className="form-group">
                    <label>Select Vehicle</label>
                    <select name="vehicleid" required onChange={handleChange}>
                        <option value="">-- Select Vehicle --</option>
                        {vehicles.map(v => (
                            <option key={v.vehicleid} value={v.vehicleid}>
                                {v.model} ({v.vehicleregistration})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Select Service Center</label>
                    <select name="centerid" required onChange={handleChange}>
                        <option value="">-- Select Center --</option>
                        {centers.map(c => (
                            <option key={c.centerid} value={c.centerid}>
                                {c.centername}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Service Date</label>
                    <input type="date" name="servicedate" required onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Service Time</label>
                    <input type="time" name="servicetime" required onChange={handleChange} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    Schedule Service
                </button>
            </form>
        </div>
    );
}
