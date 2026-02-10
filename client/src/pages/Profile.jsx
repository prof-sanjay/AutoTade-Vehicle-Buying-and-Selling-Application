
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
    const [formData, setFormData] = useState({});
    const [password, setPassword] = useState(""); // For changing password
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !user.id) {
            navigate("/login");
            return;
        }
        // Initialize form data with existing details
        // user.details contains the specific role details
        setFormData(user.details || {});
    }, [user, navigate]);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const payload = {
            userId: user.id,
            role: user.role,
            password: password, // Optional: only if user wants to change it
            ...formData
        };

        fetch("http://localhost:5000/api/auth/update-profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.user) {
                    alert("Profile Updated Successfully!");
                    // Update local storage
                    const updatedUser = { ...user, details: data.user.details };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                } else {
                    alert(data.error || "Update Failed");
                }
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                alert("Something went wrong");
            });
    }

    if (!user) return null;

    return (
        <div className="container" style={{ marginTop: "30px", maxWidth: "600px" }}>
            <div className="card" style={{ padding: "2rem" }}>
                <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Edit Profile</h2>

                <form onSubmit={handleSubmit}>
                    <div className="section-title">
                        Account Settings
                    </div>
                    <div className="form-group">
                        <label>Username (Cannot be changed)</label>
                        <input value={user.username || ""} disabled style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }} />
                    </div>
                    <div className="form-group">
                        <label>New Password (Leave blank to keep current)</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="section-title" style={{ marginTop: "2rem" }}>
                        Personal Details
                    </div>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" value={formData.name || ""} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" value={formData.email || ""} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input name="address" value={formData.address || ""} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Location ID</label>
                        <input name="locationid" type="number" value={formData.locationid || ""} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input name="phonenumber" value={formData.phonenumber || ""} onChange={handleChange} />
                    </div>

                    {/* <div className="form-group">
                        <label>Location ID</label>
                        <input name="locationid" type="number" value={formData.locationid || ""} onChange={handleChange} />
                    </div> */}

                    <div style={{ marginTop: "2rem", display: "flex", gap: "10px" }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => navigate("/")} style={{ flex: 1 }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
