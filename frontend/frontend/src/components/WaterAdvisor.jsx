import React, { useState } from "react";
import axios from "axios";
import "./WaterAdvisor.css";

const API_BASE = "http://localhost:8000"; // backend URL

const WaterAdvisor = () => {
  const [formData, setFormData] = useState({
    Soil_Type: "",
    Irrigation_Type: "",
    Water_Scarcity: "",
    Crop_Name: "",
    Rainfall_Requirement: "",
    Temperature_Requirement: "",
    Yield: "",
    Crop_Cycle_Duration: "",
  });

  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/water_advisor`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setPredictions(response.data);
    } catch (error) {
      console.error("Error predicting water use:", error);
      alert("Failed to fetch predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="water-advisor">
      <h2>💧 Water Advisor</h2>
      <p>Get irrigation recommendations based on soil, crop, and climate conditions.</p>

      <form className="water-form" onSubmit={handleSubmit}>
        {/* Soil Type */}
        <div className="form-group">
          <label>Soil Type:</label>
          <select name="Soil_Type" value={formData.Soil_Type} onChange={handleChange} required>
            <option value="">Select Soil Type</option>
            <option value="Sandy">Sandy</option>
            <option value="Clay">Clay</option>
            <option value="Loam">Loam</option>
          </select>
        </div>

        {/* Irrigation Type */}
        <div className="form-group">
          <label>Irrigation Type:</label>
          <select name="Irrigation_Type" value={formData.Irrigation_Type} onChange={handleChange} required>
            <option value="">Select Irrigation Type</option>
            <option value="Drip">Drip</option>
            <option value="Sprinkler">Sprinkler</option>
            <option value="Surface">Surface</option>
          </select>
        </div>

        {/* Water Scarcity */}
        <div className="form-group">
          <label>Water Scarcity Level:</label>
          <select name="Water_Scarcity" value={formData.Water_Scarcity} onChange={handleChange} required>
            <option value="">Select Scarcity</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Crop Name */}
        <div className="form-group">
          <label>Crop Name:</label>
          <input
            type="text"
            name="Crop_Name"
            value={formData.Crop_Name}
            onChange={handleChange}
            placeholder="Enter crop name"
            required
          />
        </div>

        {/* Rainfall Requirement */}
        <div className="form-group">
          <label>Rainfall Requirement (mm/year):</label>
          <input
            type="number"
            name="Rainfall_Requirement"
            value={formData.Rainfall_Requirement}
            onChange={handleChange}
            required
          />
        </div>

        {/* Temperature Requirement */}
        <div className="form-group">
          <label>Temperature Requirement (°C):</label>
          <input
            type="number"
            name="Temperature_Requirement"
            value={formData.Temperature_Requirement}
            onChange={handleChange}
            required
          />
        </div>

        {/* Yield */}
        <div className="form-group">
          <label>Yield (kg):</label>
          <input
            type="number"
            name="Yield"
            value={formData.Yield}
            onChange={handleChange}
            required
          />
        </div>

        {/* Crop Cycle Duration */}
        <div className="form-group">
          <label>Crop Cycle Duration (days):</label>
          <input
            type="number"
            name="Crop_Cycle_Duration"
            value={formData.Crop_Cycle_Duration}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Get Advice"}
        </button>
      </form>

      {/* Display Predictions */}
      {predictions && (
  <div className="predictions">
    <h3>🌱 Results for {predictions.crop}</h3>
    <p><strong>Soil Type:</strong> {predictions.soil_type}</p>
    <p><strong>Irrigation Type:</strong> {predictions.irrigation_type}</p>
    <p><strong>Water Scarcity:</strong> {predictions.water_scarcity}</p>
    <p><strong>Predicted Water Use:</strong> {predictions.predicted_water_use}</p>
    <p><strong>Predicted Temperature Requirement:</strong> {predictions.predicted_temperature_requirement}</p>
    <p><strong>Predicted Rainfall Requirement:</strong> {predictions.predicted_rainfall_requirement}</p>
    <p><strong>Crop Cycle Duration:</strong> {predictions.cycle_duration_days} days</p>
    <p><strong>Yield Estimate:</strong> {predictions.yield_estimate}</p>
    <p><strong>Advice:</strong> {predictions.advice}</p>
  </div>
  )}

    </div>
  );
};

export default WaterAdvisor;
