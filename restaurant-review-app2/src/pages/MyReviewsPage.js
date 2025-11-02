// src/pages/MyReviewsPage.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { Link } from 'react-router-dom';
import './MyReviewsPage.css';

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Anonymous User');

  useEffect(() => {
    // Sign in anonymously if not already
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(console.error);
    } else {
      setUserId(auth.currentUser.uid);
      setUserName(auth.currentUser.displayName || auth.currentUser.email || 'Anonymous User');
    }

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || user.email || 'Anonymous User');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const q = query(collection(db, 'reviews'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by date (newest first)
      userReviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      // Load restaurant names from localStorage
      const reviewsWithRestaurants = userReviews.map(review => {
        const savedRestaurant = localStorage.getItem(`restaurant_${review.placeId}`);
        if (savedRestaurant) {
          try {
            const restaurant = JSON.parse(savedRestaurant);
            return {
              ...review,
              restaurantName: restaurant.name,
              restaurantDisplay: restaurant.displayName
            };
          } catch (error) {
            console.error('Error parsing restaurant:', error);
          }
        }
        return {
          ...review,
          restaurantName: 'Unknown Restaurant',
          restaurantDisplay: `Restaurant ID: ${review.placeId}`
        };
      });

      setReviews(reviewsWithRestaurants);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        alert('Review deleted successfully!');
      } catch (error) {
        console.error("Delete failed:", error);
        alert('Failed to delete review.');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="myreviews-page-container">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Reviews</h2>
          <div className="text-muted">
            <strong>User:</strong> {userName}
          </div>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="alert alert-info">
            <p className="mb-2">You haven't written any reviews yet.</p>
            <Link to="/" className="btn btn-primary btn-sm">
              Search Restaurants to Review
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted mb-3">You have {reviews.length} review(s)</p>
            <div className="row">
              {reviews.map(review => (
                <div className="col-12 mb-3" key={review.id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="card-title mb-1">
                            {review.title || 'Untitled Review'}
                          </h5>
                          <Link 
                            to={`/restaurant/${review.placeId}`}
                            className="text-decoration-none"
                          >
                            <p className="text-primary mb-0">
                              <strong>{review.restaurantName}</strong>
                            </p>
                          </Link>
                          <p className="text-muted small mb-0">
                            {review.restaurantDisplay}
                          </p>
                        </div>
                        <span className="badge bg-warning text-dark fs-6">
                          {review.rating} ⭐
                        </span>
                      </div>

                      <p className="card-text mt-3">{review.comment}</p>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                          Posted: {formatDate(review.createdAt)}
                        </small>
                        <div>
                          <Link
                            to={`/review/edit/${review.id}`}
                            state={{ 
                              review,
                              restaurant: {
                                id: review.placeId,
                                name: review.restaurantName
                              }
                            }}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
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

export default MyReviewsPage;