import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";

export default function VehicleList() {
    const [vehicles, setVehicles] = useState([]);
    const [filters, setFilters] = useState({ fuel: "", maxPrice: "" });

    useEffect(() => {
        fetch("http://localhost:5000/api/vehicles")
            .then(res => res.json())
            .then(data => setVehicles(data));
    }, []);

    const filteredVehicles = vehicles.filter(v => {
        let match = true;
        if (filters.fuel && v.fueltype !== filters.fuel) match = false;
        if (filters.maxPrice && parseFloat(v.price) > parseFloat(filters.maxPrice)) match = false;
        return match;
    });

    return (
        <div className="container" style={{ margin: "2rem auto", display: "grid", gridTemplateColumns: "250px 1fr", gap: "2rem" }}>

            {/* Sidebar Filters */}
            <aside className="card" style={{ padding: "1.5rem", height: "fit-content" }}>
                <h3>Filters</h3>
                <div className="form-group">
                    <label>Fuel Type</label>
                    <select onChange={e => setFilters({ ...filters, fuel: e.target.value })}>
                        <option value="">All</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Max Price</label>
                    <input type="number" placeholder="Max Price" onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
                </div>
            </aside>

            {/* Grid */}
            <div>
                <h2 style={{ marginBottom: "1rem" }}>Available Vehicles ({filteredVehicles.length})</h2>
                <div className="grid-3">
                    {filteredVehicles.map(v => (
                        <Link to={`/vehicle/${v.vehicleid}`} key={v.vehicleid} className="card">
                            <img
                                src={v.previewImage || "https://placehold.co/400x300?text=No+Image"}
                                alt={v.model}
                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                            />
                            <div style={{ padding: "1rem" }}>
                                <h3>{v.model}</h3>
                                <p style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "1.2rem" }}>₹ {v.price}</p>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-light)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                                    <span>{v.fueltype}</span>
                                    <span>{v.kmdriven} KM</span>
                                    <span>{v.transmission}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
