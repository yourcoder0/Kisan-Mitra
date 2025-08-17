import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-section">
      <h2>About Us</h2>
      <p>
        At <strong>KisanMitra </strong>, we believe in empowering
        farmers with cutting-edge AI tools to create a sustainable future. Our
        mission is to make farming smarter, more efficient, and resilient to
        climate change challenges.
      </p>
      <div className="about-us-grid">
        <div className="about-card">
          <h3>Our Mission</h3>
          <p>
            To help the farmers to enhance the agriculture sector by integrating AI.
          </p>
        </div>
        <div className="about-card">
          <h3>Our Vision</h3>
          <p>
            A future where technology and agriculture work hand-in-hand to
            ensure a thriving planet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
