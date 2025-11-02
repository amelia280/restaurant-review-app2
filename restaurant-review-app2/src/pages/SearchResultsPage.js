// src/pages/SearchResultsPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchRestaurants } from '../services/restaurantApi';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');

    if (!query) {
      setLoading(false);
      return;
    }

    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchRestaurants(query, 10);
        console.log('Search results:', results);
        setRestaurants(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [location.search]);

  const query = new URLSearchParams(location.search).get('q');

  return (
    <div className="search-results-container">
      <div className="container mt-4">
        <h2>Search Results {query ? `for "${query}"` : ''}</h2>
        <Link to="/" className="btn btn-outline-secondary mb-3">← Back to Home</Link>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Searching restaurants...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            Error: {error}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="alert alert-info" role="alert">
            No restaurants found for "{query}". Try searching for "restaurant", "cafe", or "pizza".
          </div>
        ) : (
          <>
            <p className="text-muted mb-3">Found {restaurants.length} restaurant(s)</p>
            <div className="row">
              {restaurants.map((restaurant) => (
                <div className="col-md-6 mb-3" key={restaurant.id}>
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{restaurant.name}</h5>
                      <p className="card-text text-muted small">{restaurant.displayName}</p>
                      <p className="mb-1">
                        <strong>Type:</strong> {restaurant.type}
                      </p>
                      <p className="mb-1">
                        <strong>Cuisine:</strong> {restaurant.cuisine}
                      </p>
                      {restaurant.phone && restaurant.phone !== 'N/A' && (
                        <p className="mb-1">
                          <strong>Phone:</strong> {restaurant.phone}
                        </p>
                      )}
                      <Link
                        to={`/restaurant/${restaurant.id}`}
                        state={{ restaurant }}
                        className="btn btn-primary mt-2"
                      >
                        View Details & Reviews
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;