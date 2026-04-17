
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../index.css";

export default function BookService() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    // Pre-fill from URL if available
    
    const centerIdParam = searchParams.get("centerid");

    const centerNameParam = searchParams.get("name");

    const [formData, setFormData] = useState({
        centerid: centerIdParam || "",
        vehiclename: "",
        registration: "",
        kmdriven: "",

        fueltype: "Petrol"
    });

    useEffect(() => {
        if (!user) {
            navigate("/login");

            return;
        }

    }, [user, navigate]);

    async function handleSubmit(e) {

        e.preventDefault();

        const confirmBooking = window.confirm(
            "Are you sure you want to book this service?"
        );

        if (!confirmBooking) return;


            // Create a booking object with the required fields
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
                navigate("/login");
                return;
            }

            

            const bookingData = {
                centerid: formData.centerid,
                vehicleid: 1, 
                servicetypeid: 1, 
                servicedate: new Date().toISOString().split('T')[0], 
                servicetime: '10:00 AM', 
                paymentmode: 'Cash' 

            };

            const response = await fetch('http://localhost:5000/api/services/book', {

                method: 'POST',
                headers: {

                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                throw new Error('Failed to book service');

            }

            const result = await response.json();
            console.log('Booking successful:', result);


            alert("✅ Service Booked Successfully!");
            navigate("/my-bookings");
        } catch (error) {
            console.error('Error booking service:', error);
            alert("❌ Failed to book service. Please try again.");
        }
    }

    return (
        <div className="container" style={{ marginTop: "30px", maxWidth: "600px" }}>
            <div className="card" style={{ padding: "2rem" }}>

                <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Book Service</h2>
                {centerNameParam && <p style={{ textAlign: "center", marginBottom: "1rem" }}>at <strong>{centerNameParam}</strong></p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Vehicle Model</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter vehicle model and year (e.g., Maruti Swift 2020)"
                            value={formData.vehiclename}

                            onChange={e => setFormData({ ...formData, vehiclename: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Registration Number</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter vehicle registration number"
                            value={formData.registration}

                            onChange={e => setFormData({ ...formData, registration: e.target.value })}
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Kilometers Driven</label>
                        <input
                            type="number"
                            required
                            min="0"
                            placeholder="Enter kilometers driven"
                            value={formData.kmdriven}

                            onChange={e => setFormData({ ...formData, kmdriven: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Fuel Type</label>
                        <select
                            value={formData.fueltype}

                            onChange={e => setFormData({ ...formData, fueltype: e.target.value })}
                        >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="CNG">CNG</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid (Petrol + Electric)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                        Book Service
                    </button>
                </form>
            </div>
        </div>
    );
}
