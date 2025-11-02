// src/pages/RestaurantDetailPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import ReviewCard from '../components/ReviewCard';
import './RestaurantDetailPage.css';

const RestaurantDetailPage = () => {
  const { placeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no placeId in URL, go back
    if (!placeId) {
      navigate('/search');
      return;
    }

    let foundRestaurant = null;

    // Try router state first
    if (location.state?.restaurant && String(location.state.restaurant.id) === placeId) {
      foundRestaurant = location.state.restaurant;
    }

    // Fallback to localStorage
    if (!foundRestaurant) {
      const saved = localStorage.getItem(`restaurant_${placeId}`);
      if (saved) {
        foundRestaurant = JSON.parse(saved);
      }
    }

    // Final fallback (minimal)
    if (!foundRestaurant) {
      foundRestaurant = {
        id: placeId,
        name: 'Restaurant',
        displayName: 'Information currently unavailable. Please try searching again.',
        osmUrl: `https://www.openstreetmap.org/search?query=${encodeURIComponent(placeId)}`
      };
    }

    setRestaurant(foundRestaurant);
    localStorage.setItem(`restaurant_${placeId}`, JSON.stringify(foundRestaurant));

    // Load reviews
    const q = query(collection(db, 'reviews'), where('placeId', '==', placeId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [placeId, location.state, navigate]);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  if (loading && !restaurant) {
    return (
      <div className="restaurant-detail-container">
        <div className="container mt-5">
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Fetching restaurant details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-detail-container">
      <div className="container mt-4">
        {/* Back Navigation */}
        <button onClick={() => navigate(-1)} className="btn-back mb-4">
          ← Return to Search
        </button>

        {/* Restaurant Info Card */}
        <div className="restaurant-header-card">
          <div className="restaurant-icon"></div>
          <div className="restaurant-info">
            <h1 className="restaurant-name">{restaurant.name}</h1>
            <p className="restaurant-description">{restaurant.displayName}</p>
            
            {/* Rating Display */}
            {reviews.length > 0 && (
              <div className="rating-display">
                <span className="rating-stars">⭐ {averageRating}</span>
                <span className="rating-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <a
                href={restaurant.osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-map"
              >
                View Location
              </a>
              <Link
                to={`/review/new/${placeId}`}
                state={{ restaurant }}
                className="btn-write-review"
              >
                Share Your Experience
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">
              Community Reviews
              <span className="reviews-count">{reviews.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="loading-reviews">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews-card">
              <div className="no-reviews-icon"></div>
              <h3>No Reviews Yet</h3>
              <p>Be the first to share your dining experience at this restaurant!</p>
              <Link
                to={`/review/new/${placeId}`}
                state={{ restaurant }}
                className="btn-write-first"
              >
                Write the First Review
              </Link>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map(review => (
                <div className="review-wrapper" key={review.id}>
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;