import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Parts from "./pages/Parts";
import ServiceCenters from "./pages/ServiceCenters";
import BookService from "./pages/BookService";
import MyBookings from "./pages/MyBookings";
import ServiceDashboard from "./pages/ServiceDashboard";
import AddVehicle from "./pages/AddVehicle";
import VehicleList from "./pages/VehicleList";
import VehicleDetails from "./pages/VehicleDetails";
import VerificationPage from "./pages/VerificationPage";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicle/:id" element={<VehicleDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/services" element={<ServiceCenters />} />
          <Route path="/services/book" element={<BookService />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/service-dashboard" element={<ServiceDashboard />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/verify/vehicle/:id" element={<VerificationPage />} />
          <Route path="/verify/part/:id" element={<VerificationPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
