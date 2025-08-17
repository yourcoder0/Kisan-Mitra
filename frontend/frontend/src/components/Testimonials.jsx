import React from "react";
import "./Testimonials.css";

const Testimonials = () => {
  const testimonials = [

  ];

  return (
    <div className="testimonials-section">
      <h2></h2>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <p className="quote">“{testimonial.quote}”</p>
            <p className="author">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
