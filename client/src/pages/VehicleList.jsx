import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../index.css";

const API = "http://localhost:5000";

function imgUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;   // Cloudinary or external URL
    return API + path;                           // local /uploads/...
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

const INIT_FILTERS = {
    search: "",
    minPrice: "",
    maxPrice: "",
    fuel: [],
    transmission: "",
    minYear: "",
    maxYear: "",
    maxKm: "",
    color: "",
    status: "",
    sort: "newest",
};

export default function VehicleList() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(INIT_FILTERS);

    useEffect(() => {
        fetch(`${API}/api/vehicles`)
            .then(res => res.json())
            .then(data => { setVehicles(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const availableColors = useMemo(() => {
        const colors = [...new Set(vehicles.map(v => v.color).filter(Boolean))];
        return colors.sort();
    }, [vehicles]);

    function setFilter(key, val) {
        setFilters(f => ({ ...f, [key]: val }));
    }

    function toggleFuel(fuel) {
        setFilters(f => ({
            ...f,
            fuel: f.fuel.includes(fuel) ? f.fuel.filter(x => x !== fuel) : [...f.fuel, fuel],
        }));
    }

    function clearFilters() { setFilters(INIT_FILTERS); }

    const activeFilterCount = useMemo(() => {
        let c = 0;
        if (filters.search) c++;
        if (filters.minPrice) c++;
        if (filters.maxPrice) c++;
        if (filters.fuel.length) c++;
        if (filters.transmission) c++;
        if (filters.minYear) c++;
        if (filters.maxYear) c++;
        if (filters.maxKm) c++;
        if (filters.color) c++;
        if (filters.status) c++;
        return c;
    }, [filters]);

    const filtered = useMemo(() => {
        let result = vehicles.filter(v => {
            if (filters.search && !v.model?.toLowerCase().includes(filters.search.toLowerCase())) return false;
            if (filters.minPrice && parseFloat(v.price) < parseFloat(filters.minPrice)) return false;
            if (filters.maxPrice && parseFloat(v.price) > parseFloat(filters.maxPrice)) return false;
            if (filters.fuel.length && !filters.fuel.includes(v.fueltype)) return false;
            if (filters.transmission && v.transmission !== filters.transmission) return false;
            if (filters.color && v.color?.toLowerCase() !== filters.color.toLowerCase()) return false;
            if (filters.status && v.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
            const year = v.dateofmanufacture ? new Date(v.dateofmanufacture).getFullYear() : null;
            if (filters.minYear && year && year < parseInt(filters.minYear)) return false;
            if (filters.maxYear && year && year > parseInt(filters.maxYear)) return false;
            if (filters.maxKm && parseInt(v.kmdriven) > parseInt(filters.maxKm)) return false;
            return true;
        });

        switch (filters.sort) {
            case "price_asc":  result = [...result].sort((a, b) => a.price - b.price); break;
            case "price_desc": result = [...result].sort((a, b) => b.price - a.price); break;
            case "newest":     result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
            case "year_desc":  result = [...result].sort((a, b) => new Date(b.dateofmanufacture) - new Date(a.dateofmanufacture)); break;
            case "km_asc":     result = [...result].sort((a, b) => a.kmdriven - b.kmdriven); break;
            default: break;
        }
        return result;
    }, [vehicles, filters]);

    const statusColor = s => {
        if (!s || s.toLowerCase() === "available") return "#4caf50";
        if (s.toLowerCase() === "pending") return "#ff9800";
        if (s.toLowerCase() === "sold") return "#f44336";
        return "#9e9e9e";
    };

    return (
        <div style={{ background: "var(--background)", minHeight: "100vh" }}>
            {/* Page header */}
            <div style={{ background: "var(--secondary)", color: "white", padding: "1.5rem 0" }}>
                <div className="container">
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Browse Vehicles</h1>
                    <p style={{ color: "#aaa", marginTop: "4px" }}>
                        {loading ? "Loading listings..." : `${vehicles.length} listings available`}
                    </p>
                </div>
            </div>

            <div className="container" style={{ margin: "2rem auto", display: "grid", gridTemplateColumns: "280px 1fr", gap: "2rem", alignItems: "start" }}>

                {/* ── FILTER SIDEBAR ── */}
                <aside style={{ background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: "1.5rem", position: "sticky", top: "80px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "2px solid var(--primary)", paddingBottom: "0.75rem" }}>
                        <h3 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                            Filters
                            {activeFilterCount > 0 && (
                                <span style={{
                                    background: "var(--primary)", color: "white", borderRadius: "50%",
                                    width: "22px", height: "22px", display: "inline-flex",
                                    alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
                                }}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </h3>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} style={{
                                background: "none", border: "1px solid var(--primary)", color: "var(--primary)",
                                borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem"
                            }}>
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <FilterSection label="Search Model">
                        <input
                            placeholder="e.g. Swift, Innova, Fortuner..."
                            value={filters.search}
                            onChange={e => setFilter("search", e.target.value)}
                        />
                    </FilterSection>

                    {/* Price Range */}
                    <FilterSection label="Price Range (₹)">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <input type="number" placeholder="Min" value={filters.minPrice}
                                onChange={e => setFilter("minPrice", e.target.value)} />
                            <input type="number" placeholder="Max" value={filters.maxPrice}
                                onChange={e => setFilter("maxPrice", e.target.value)} />
                        </div>
                    </FilterSection>

                    {/* Fuel Type */}
                    <FilterSection label="Fuel Type">
                        {["Petrol", "Diesel", "Electric", "Hybrid", "CNG"].map(fuel => (
                            <label key={fuel} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", cursor: "pointer", fontWeight: "normal" }}>
                                <input
                                    type="checkbox"
                                    style={{ width: "auto", margin: 0 }}
                                    checked={filters.fuel.includes(fuel)}
                                    onChange={() => toggleFuel(fuel)}
                                />
                                {fuel}
                            </label>
                        ))}
                    </FilterSection>

                    {/* Transmission */}
                    <FilterSection label="Transmission">
                        <select value={filters.transmission} onChange={e => setFilter("transmission", e.target.value)}>
                            <option value="">All</option>
                            <option>Manual</option>
                            <option>Automatic</option>
                            <option>AMT</option>
                            <option>CVT</option>
                            <option>DCT</option>
                        </select>
                    </FilterSection>

                    {/* Year Range */}
                    <FilterSection label="Year of Manufacture">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <select value={filters.minYear} onChange={e => setFilter("minYear", e.target.value)}>
                                <option value="">From</option>
                                {YEARS.map(y => <option key={y}>{y}</option>)}
                            </select>
                            <select value={filters.maxYear} onChange={e => setFilter("maxYear", e.target.value)}>
                                <option value="">To</option>
                                {YEARS.map(y => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                    </FilterSection>

                    {/* KM Driven */}
                    <FilterSection label="Max KM Driven">
                        <select value={filters.maxKm} onChange={e => setFilter("maxKm", e.target.value)}>
                            <option value="">Any</option>
                            <option value="10000">Under 10,000 km</option>
                            <option value="30000">Under 30,000 km</option>
                            <option value="50000">Under 50,000 km</option>
                            <option value="75000">Under 75,000 km</option>
                            <option value="100000">Under 1,00,000 km</option>
                            <option value="150000">Under 1,50,000 km</option>
                        </select>
                    </FilterSection>

                    {/* Color */}
                    {availableColors.length > 0 && (
                        <FilterSection label="Color">
                            <select value={filters.color} onChange={e => setFilter("color", e.target.value)}>
                                <option value="">All Colors</option>
                                {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </FilterSection>
                    )}

                    {/* Availability */}
                    <FilterSection label="Availability">
                        <select value={filters.status} onChange={e => setFilter("status", e.target.value)}>
                            <option value="">All</option>
                            <option value="available">Available</option>
                            <option value="pending">Pending Sale</option>
                        </select>
                    </FilterSection>
                </aside>

                {/* ── RESULTS ── */}
                <div>
                    {/* Toolbar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "10px" }}>
                        <p style={{ color: "var(--text-light)" }}>
                            {!loading && (
                                <><strong style={{ color: "var(--text-main)" }}>{filtered.length}</strong> of {vehicles.length} vehicles</>
                            )}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <label style={{ fontSize: "0.9rem", color: "var(--text-light)", whiteSpace: "nowrap" }}>Sort by:</label>
                            <select value={filters.sort} onChange={e => setFilter("sort", e.target.value)}
                                style={{ width: "auto", padding: "8px 12px" }}>
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                                <option value="year_desc">Year: Newest</option>
                                <option value="km_asc">KM: Lowest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {activeFilterCount > 0 && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
                            {filters.search && <Chip label={`"${filters.search}"`} onRemove={() => setFilter("search", "")} />}
                            {filters.minPrice && <Chip label={`Min ₹${Number(filters.minPrice).toLocaleString("en-IN")}`} onRemove={() => setFilter("minPrice", "")} />}
                            {filters.maxPrice && <Chip label={`Max ₹${Number(filters.maxPrice).toLocaleString("en-IN")}`} onRemove={() => setFilter("maxPrice", "")} />}
                            {filters.fuel.map(f => <Chip key={f} label={f} onRemove={() => toggleFuel(f)} />)}
                            {filters.transmission && <Chip label={filters.transmission} onRemove={() => setFilter("transmission", "")} />}
                            {filters.minYear && <Chip label={`From ${filters.minYear}`} onRemove={() => setFilter("minYear", "")} />}
                            {filters.maxYear && <Chip label={`To ${filters.maxYear}`} onRemove={() => setFilter("maxYear", "")} />}
                            {filters.maxKm && <Chip label={`<${Number(filters.maxKm).toLocaleString("en-IN")} km`} onRemove={() => setFilter("maxKm", "")} />}
                            {filters.color && <Chip label={filters.color} onRemove={() => setFilter("color", "")} />}
                            {filters.status && <Chip label={filters.status} onRemove={() => setFilter("status", "")} />}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} style={{ background: "#e8e8e8", borderRadius: "var(--radius)", height: "320px" }} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "white", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                            <h3 style={{ marginBottom: "0.5rem" }}>No vehicles match your filters</h3>
                            <p style={{ color: "var(--text-light)", marginBottom: "1.5rem" }}>Try adjusting or clearing your criteria</p>
                            <button onClick={clearFilters} className="btn btn-primary">Clear All Filters</button>
                        </div>
                    ) : (
                        <div className="grid-3">
                            {filtered.map(v => {
                                const img = imgUrl(v.previewImage);
                                const year = v.dateofmanufacture ? new Date(v.dateofmanufacture).getFullYear() : null;
                                return (
                                    <Link to={`/vehicle/${v.vehicleid}`} key={v.vehicleid} className="card"
                                        style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                                        <div style={{ position: "relative" }}>
                                            <img
                                                src={img || "/default-car.png"}
                                                alt={v.model}
                                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                                onError={e => { e.target.src = "/default-car.png"; }}
                                            />
                                            <span style={{
                                                position: "absolute", top: "10px", right: "10px",
                                                background: statusColor(v.status),
                                                color: "white", padding: "3px 10px", borderRadius: "20px",
                                                fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize"
                                            }}>
                                                {v.status || "Available"}
                                            </span>
                                            {v.featured && (
                                                <span style={{
                                                    position: "absolute", top: "10px", left: "10px",
                                                    background: "#ff9800", color: "white", padding: "3px 10px",
                                                    borderRadius: "20px", fontSize: "0.72rem", fontWeight: 600
                                                }}>
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ padding: "1rem" }}>
                                            <h3 style={{ marginBottom: "4px", fontSize: "1.05rem", fontWeight: 600 }}>{v.model}</h3>
                                            <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.3rem", margin: "6px 0" }}>
                                                ₹ {Number(v.price).toLocaleString("en-IN")}
                                            </p>
                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                                                {[
                                                    year,
                                                    v.fueltype,
                                                    v.transmission,
                                                    v.kmdriven ? Number(v.kmdriven).toLocaleString("en-IN") + " km" : null
                                                ].filter(Boolean).map((tag, i) => (
                                                    <span key={i} style={{
                                                        background: "#f0f0f0", borderRadius: "4px",
                                                        padding: "3px 8px", fontSize: "0.78rem", color: "#555"
                                                    }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            {v.color && (
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "6px" }}>
                                                    Color: {v.color}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FilterSection({ label, children }) {
    return (
        <div className="form-group">
            <label style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-light)", letterSpacing: "0.5px", fontWeight: 600 }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function Chip({ label, onRemove }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: "#fdecea", color: "var(--primary)", border: "1px solid #f5c6c6",
            borderRadius: "20px", padding: "3px 10px", fontSize: "0.8rem"
        }}>
            {label}
            <button onClick={onRemove} style={{
                background: "none", border: "none", color: "var(--primary)",
                cursor: "pointer", padding: 0, fontSize: "0.85rem", lineHeight: 1
            }}>×</button>
        </span>
    );
}
