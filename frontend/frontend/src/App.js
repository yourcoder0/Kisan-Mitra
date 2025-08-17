import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import CropSelectorPage from "./pages/CropSelectorPage";
import LandingPage from "./pages/LandingPage";
import AboutUsPage from "./pages/AboutUsPage";
import FarmerCalendar from "./components/FarmerCalendar";
import WaterAdvisor from "./components/WaterAdvisor";
import ROIChecker from "./pages/ROICheckerpage"; 
import GovtSchemesPage from "./pages/GovtSchemesPage"; 
import FarmerChatbotPage from "./pages/FarmerChatbotPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TranslationService from "./utils/TranslationService";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/crop-selector" element={<CropSelectorPage />} />
          <Route path="/water-advisor" element={<WaterAdvisor />} />
          <Route path="/farm-calendar" element={<FarmerCalendar />} />
          <Route path="/roi-checker" element={<ROIChecker />} />
          <Route path="/govt-schemes" element={<GovtSchemesPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/chatbot" element={<FarmerChatbotPage />} />
        </Routes>
        <TranslationService />
        <Footer />
      </Router>
    </div>
  );
}

export default App;
