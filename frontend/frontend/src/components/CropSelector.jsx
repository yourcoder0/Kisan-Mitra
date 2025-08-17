import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CropSelector.css";
import MapSelector from "./MapSelector";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

const CropSelector = () => {
  const [coordinates, setCoordinates] = useState([28.6139, 77.209]);
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [ph, setPh] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [dailyWeather, setDailyWeather] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fetch weather data
  const fetchMonthlyWeatherData = async (lat, lon) => {
    setWeatherLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formattedStartDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

      const response = await axios.get(url);
      const data = response.data;

      const { temperature_2m_max, temperature_2m_min, precipitation_sum, time } =
        data.daily;

      const avgTemp =
        temperature_2m_max.reduce((a, b) => a + b, 0) /
        temperature_2m_max.length;
      const avgRainfall =
        precipitation_sum.reduce((a, b) => a + b, 0) /
        precipitation_sum.length;

      setWeatherData({
        averageTemperature: avgTemp,
        averageRainfall: avgRainfall,
      });

      setDailyWeather({
        dates: time,
        maxTemperatures: temperature_2m_max,
        minTemperatures: temperature_2m_min,
        rainfall: precipitation_sum,
      });
    } catch (error) {
      console.error("Error fetching monthly weather data:", error);
      setWeatherData({ averageTemperature: 0, averageRainfall: 0 });
      setDailyWeather([]);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      fetchMonthlyWeatherData(coordinates[0], coordinates[1]);
    }
  }, [coordinates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nitrogen || !phosphorus || !potassium || !ph) {
      alert("Please fill in all the fields.");
      return;
    }
    setLoading(true);

   const WData = {
  N: nitrogen,
  P: phosphorus,
  K: potassium,
  ph: ph,
  temperature: weatherData.averageTemperature,
  rainfall: weatherData.averageRainfall * 365, // ✅ convert daily avg → annual mm/year
  expected_yield: 0
};


    try {
      const response = await axios.post(
       "http://127.0.0.1:8000/api/select_crop",
        WData,
      {
      headers: { "Content-Type": "application/json" },
     }
 );


      setRecommendations(
        response.data.recommended_crops
          ? response.data.recommended_crops.map((c) => ({ crop: c }))
          : []
      );
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setNitrogen("");
    setPhosphorus("");
    setPotassium("");
    setPh("");
    setRecommendations([]);
    setWeatherData({});
    setDailyWeather([]);
  };

  return (
    <div className="crop-selector">
      <h2>Crop Selector Tool</h2>
      <form className="crop-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Location (Select on Map):</label>
          <p>
            Latitude: {coordinates[0].toFixed(4)}, Longitude:{" "}
            {coordinates[1].toFixed(4)}
          </p>
          <MapSelector setCoordinates={setCoordinates} />
        </div>

        {weatherLoading ? (
          <p>Loading weather data...</p>
        ) : (
          <p>
            Avg Temp: {weatherData.averageTemperature?.toFixed(2)} °C <br />
            Avg Rainfall: {weatherData.averageRainfall?.toFixed(2)} mm
          </p>
        )}

        <div className="form-group">
          <label>Nitrogen (N):</label>
          <input
            type="number"
            value={nitrogen}
            onChange={(e) => setNitrogen(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Phosphorus (P):</label>
          <input
            type="number"
            value={phosphorus}
            onChange={(e) => setPhosphorus(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Potassium (K):</label>
          <input
            type="number"
            value={potassium}
            onChange={(e) => setPotassium(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>pH of Soil:</label>
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Finding Crops..." : "Find Crops"}
        </button>
        <button type="button" onClick={resetForm} disabled={loading}>
          Reset
        </button>
      </form>

      <div className="recommendations">
        <strong>Recommended Crops:</strong>
        {recommendations.length > 0 ? (
          <ul className="crop-list">
            {recommendations.map((rec, i) => (
              <li key={i}>
                <h3>{rec.crop}</h3>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recommendations available.</p>
        )}
      </div>

      {dailyWeather.dates && (
        <div className="weather-trends">
          <h3>Weather Trends</h3>
          <Line
            data={{
              labels: dailyWeather.dates,
              datasets: [
                {
                  label: "Max Temp (°C)",
                  data: dailyWeather.maxTemperatures,
                  borderColor: "red",
                  fill: false,
                },
                {
                  label: "Min Temp (°C)",
                  data: dailyWeather.minTemperatures,
                  borderColor: "blue",
                  fill: false,
                },
              ],
            }}
          />
          <Bar
            data={{
              labels: dailyWeather.dates,
              datasets: [
                {
                  label: "Rainfall (mm)",
                  data: dailyWeather.rainfall,
                  backgroundColor: "rgba(75,192,192,0.4)",
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CropSelector;
