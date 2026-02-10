import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Car, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import "./Login.css"; // Import the custom CSS file

export default function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            navigate("/profile");
        } else {
            setCheckingAuth(false);
        }
    }, [navigate]);

    function handleSubmit(e) {
        e.preventDefault();
        setError(""); // Clear previous errors

        fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    navigate("/profile");
                    window.location.reload(); // Quick refresh to update navbar
                } else {
                    setError(data.error || "Invalid credentials");
                }
            })
            .catch(err => {
                setError("Network error. Please try again later.");
                console.error("Login Error:", err);
            });
    }

    if (checkingAuth) return null;

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-container">
                        <Car className="logo-icon" size={32} />
                        <span className="logo-text">AutoTrade</span>
                    </div>
                    <h2 className="login-title">Welcome back! Please sign in.</h2>
                </div>

                {error && <div className="error-message" style={{ color: "var(--primary)", textAlign: "center", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-icon-wrapper">
                            <User className="input-icon" size={18} />
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                className="login-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                        <a href="#" style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>Forgot Password?</a>
                    </div>

                    <button type="submit" className="login-btn">
                        Sign In <ArrowRight size={18} style={{ marginLeft: "8px", verticalAlign: "middle" }} />
                    </button>
                </form>

                <div className="login-footer">
                    Don't have an account?
                    <Link to="/register" className="register-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
