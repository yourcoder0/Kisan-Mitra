import React, { useState } from "react";
import axios from "axios";
import "./ROIChecker.css";

const API_BASE = "http://localhost:8000"; // adjust for deployment

export default function ROIChecker() {
  const [crop, setCrop] = useState("wheat");
  const [investment, setInvestment] = useState(8000);
  const [expectedYield, setExpectedYield] = useState(200);
  const [marketPrice, setMarketPrice] = useState(25);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateROI = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/calculate_roi`, {
        crop,
        investment: parseFloat(investment),
        expected_yield: parseFloat(expectedYield), // ✅ backend expects this
        market_price: parseFloat(marketPrice),     // ✅ backend expects this
      });
      setResult(res.data);
    } catch (err) {
      console.error("ROI fetch error:", err);
      setResult({ error: "Failed to fetch ROI. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="roi-checker">
      <h2>💰 ROI Checker – KisanMitra</h2>
      <p>Estimate the Return on Investment for your crop or farming input.</p>

      <div>
        <label>Crop: </label>
        <input
          type="text"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />
      </div>

      <div>
        <label>Investment (₹): </label>
        <input
          type="number"
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
        />
      </div>

      <div>
        <label>Expected Yield (kg/quintal): </label>
        <input
          type="number"
          value={expectedYield}
          onChange={(e) => setExpectedYield(e.target.value)}
        />
      </div>

      <div>
        <label>Market Price (₹ per unit): </label>
        <input
          type="number"
          value={marketPrice}
          onChange={(e) => setMarketPrice(e.target.value)}
        />
      </div>

      <button onClick={calculateROI} disabled={loading}>
        {loading ? "Calculating..." : "Calculate ROI"}
      </button>

      {result && (
        <div className="roi-result">
          {result.error ? (
            <p style={{ color: "red" }}>{result.error}</p>
          ) : (
            <>
              <h3>Results</h3>
              <p><strong>Revenue:</strong> ₹{result.revenue}</p>
              <p><strong>Profit:</strong> ₹{result.revenue - result.investment}</p>
              <p><strong>ROI %:</strong> {result.roi_percent}%</p>

              <div style={{ marginTop: "1em" }}>
                <h4>Comparison Chart</h4>
                <progress
                  value={result.revenue}
                  max={result.revenue + 1000}
                  style={{ width: "100%" }}
                />
                <p>
                  Investment: ₹{result.investment} | Revenue: ₹{result.revenue}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
