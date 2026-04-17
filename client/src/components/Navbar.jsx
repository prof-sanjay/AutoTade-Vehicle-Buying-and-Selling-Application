import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Car } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const navigate = useNavigate();
    const location = useLocation();

    if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/") {
        return null;
    }

    function logout() {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    }

    const isServiceCenter = user && (user.role === "servicecenter" || user.role === "service_center");

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo">
                    <Car size={28} /> AutoTrade
                </Link>

                <div className="nav-links">
                    {isServiceCenter ? (
                        <>
                            <Link to="/service-dashboard">Service Dashboard</Link>
                            <Link to="/profile">Hello, {user.username}</Link>
                            <button onClick={logout} className="btn-icon">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/home">Home</Link>
                            <Link to="/vehicles">Vehicles</Link>
                            <Link to="/parts">AutoParts</Link>
                            <Link to="/orders">Sale & Orders</Link>
                            <Link to="/add-vehicle" className="btn btn-primary">Sell Car</Link>

                            {user ? (
                                <>
                                    <Link to="/profile">Hello, {user.username}</Link>
                                    <button onClick={logout} className="btn-icon">
                                        <LogOut size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">Login</Link>
                                    <Link to="/register" className="btn btn-primary">Sign Up</Link>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
