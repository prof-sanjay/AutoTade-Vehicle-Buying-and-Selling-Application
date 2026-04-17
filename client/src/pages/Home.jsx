import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../index.css";

const API = "http://localhost:5000";
function imgUrl(path) {
    if (!path) return null;
    return path.startsWith("http") ? path : API + path;
}

export default function Home() {
    const [featuredCars, setFeaturedCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/api/vehicles?featured=true")
            .then(res => res.json())
            .then(data => {
                setFeaturedCars(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch featured cars", err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            {/* HERO SECTION */}
            
            <div className="hero">
                <div className="hero-content">
                    <h1>Find Your Dream Car</h1>
                    <p>Best collection of luxury and sports cars</p>
                    <Link to="/vehicles" className="btn btn-primary">Browse All Cars</Link>
                </div>

            </div>

            <div className="container" style={{ margin: "4rem auto" }}>
                <h2
                    style={{
                        fontSize: "2rem",
                        marginBottom: "2rem",
                        borderLeft: "5px solid var(--primary)",
                        paddingLeft: "10px",
                    }}
                >

                    Featured Vehicles
                </h2>

                {loading ? <p>Loading featured cars...</p> : (
                    <div className="grid-3">
                        {featuredCars.length > 0 ? (
                            featuredCars.map(car => (
                                <Link to={`/vehicle/${car.vehicleid}`} className="card" key={car.vehicleid}>
                                    <img
                                        src={imgUrl(car.previewImage) || "/default-car.png"}
                                        alt={car.model}
                                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                        onError={e => { e.target.src = "/default-car.png"; }}
                                    />
                                    <div style={{ padding: "1rem" }}>
                                        <h3>{car.model}</h3>
                                        <p style={{ color: "var(--primary)", fontWeight: "bold" }}>
                                            ₹ {Number(car.price).toLocaleString()}
                                        </p>
                                        <p style={{ color: "var(--text-light)" }}>
                                            {new Date(car.dateofmanufacture).getFullYear()} • {car.fueltype} • {car.transmission}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No featured vehicles available at the moment.</p>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
