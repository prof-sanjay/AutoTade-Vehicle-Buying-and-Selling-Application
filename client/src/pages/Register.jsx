import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Register() {
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        // Default role is 'user' handled by backend if omitted, or we can send it.
        // We'll send role: 'user' just to be explicit if needed, or rely on backend default.
        const payload = { ...formData, role: 'user' };

        fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.userId) {
                    alert("Registration Successful!");
                    navigate("/login");
                } else {
                    alert(data.error || "Failed");
                }
            });
    }

    return (
        <div className="container" style={{ marginTop: "50px", maxWidth: "600px" }}>
            <div className="card" style={{ padding: "2rem" }}>
                <h2 style={{ textAlign: "center" }}>Create Account</h2>

                <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
                    <div className="form-group">
                        <label>Username</label>
                        <input name="username" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" onChange={handleChange} required />
                    </div>

                    <div className="form-group"><label>Full Name</label><input name="name" onChange={handleChange} required /></div>
                    <div className="form-group"><label>Email</label><input name="email" type="email" onChange={handleChange} /></div>
                    <div className="form-group"><label>Address</label><input name="address" onChange={handleChange} /></div>

                    <div className="form-group"><label>Phone Number</label><input name="phonenumber" onChange={handleChange} /></div>
                    <div className="form-group"><label>Location ID (1 for Demo)</label><input name="locationid" type="number" onChange={handleChange} /></div>

                    <button className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Register</button>
                </form>
            </div>
        </div>
    );
}
