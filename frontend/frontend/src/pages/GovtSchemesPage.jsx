import React, { useState } from "react";
import axios from "axios";
import "./GovtSchemesPage.css";

function GovtSchemesPage() {
  const [query, setQuery] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);

    try {
      // Replace with your backend API later
      const res = await axios.get("http://127.0.0.1:8000/api/schemes", {
        params: { query },
      });
      setSchemes(res.data.schemes || []);
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setSchemes([
        { name: "PM-KISAN", description: "Direct income support to farmers." },
        { name: "PMFBY", description: "Crop insurance against natural disasters." },
        { name: "Soil Health Card", description: "Subsidy & testing support for soil health." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="schemes-page">
      <h2>Government Schemes Advisor</h2>
      <p>Discover subsidies, loans, and support programs for farmers.</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search schemes (e.g., loan, insurance)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading schemes...</p>}

      <div className="schemes-list">
        {schemes.length > 0 ? (
          schemes.map((scheme, idx) => (
            <div key={idx} className="scheme-card">
              <h3>{scheme.name}</h3>
              <p>{scheme.description}</p>
            </div>
          ))
        ) : (
          !loading && <p>No schemes found. Try a different keyword.</p>
        )}
      </div>
    </div>
  );
}

export default GovtSchemesPage;
