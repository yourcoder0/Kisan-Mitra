import React from "react";
import "./Hero.css";
import img from "../images/heroimg.png";

const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">KisanMitra – The Agentic Agriculture & Finance Advisor</h1>
        <p className="hero-description">
          Empowering farmers with intelligent tools to optimize crop yields,
          conserve resources, and adapt to climate change.
        </p>
        <button className="hero-button">
          <a href="https://www.sciencedirect.com/science/article/pii/S258972172030012X" target="_blank" rel="noopener noreferrer">Learn More</a>
        </button>
      </div>
      <div className="hero-visual">
        {/* <img src={img} alt="Farming Illustration" className="hero-image" /> */}
        <video width="680" height="320" autoPlay muted loop>
          <source src="https://media.istockphoto.com/id/1332799321/video/smart-robotic-farmers-concept-robot-farmers.mp4?s=mp4-640x640-is&k=20&c=huViObeQjKh-yDHNdN00lsgQL2k9IyV3H85PKSbnofA=" type="video/mp4"/>
        </video>
      </div>
    </div>
  );
};

export default Hero;
