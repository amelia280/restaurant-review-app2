// src/pages/HomePage.js
import React from 'react';
import SearchBar from '../components/SearchBar';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            🇱🇸 Lesotho's #1 Food Community
          </div>
          
          <h1 className="hero-title">
            Taste the Kingdom,<br/>Share Your Story
          </h1>
          
          <p className="hero-subtitle">
            Join thousands of food lovers discovering the best flavors across Lesotho
          </p>

          {/* Modern Search Card */}
          <div className="search-card">
            <SearchBar />
          </div>
        </div>
      </div>

       {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready to Explore?
          </h2>
          <p className="cta-text">
            Start your culinary journey across Lesotho today. 
            Discover, review, and connect with food lovers in your area!
          </p>
          
         
        </div>
      </div>
    </div>
  );
};

export default HomePage;