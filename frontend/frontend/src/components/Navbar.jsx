import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          KisanMitra
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/crop-selector" className="nav-link">Crop Selector</Link>
          <Link to="/water-advisor" className="nav-link">Water Advisor</Link>
          <Link to="/farm-calendar" className="nav-link">Farm Calendar</Link>
          <Link to="/roi-checker" className="nav-link">ROI Checker</Link>
          <Link to="/govt-schemes" className="nav-link">Govt Schemes Advisor</Link> {/* ✅ New Link */}
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/chatbot" className="nav-link">Farmer Chatbot</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
