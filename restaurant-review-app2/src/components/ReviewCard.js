// src/components/ReviewCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import './ReviewCard.css';

const ReviewCard = ({ review, onDelete }) => {
  const isOwner = auth.currentUser && review.userId === auth.currentUser.uid;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-user-info">
          <div className="user-avatar">
            {(review.userName || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{review.userName || 'Anonymous'}</div>
            <div className="review-date">{formatDate(review.createdAt)}</div>
          </div>
        </div>
        <div className="review-rating">
          <span className="rating-value">{review.rating}</span>
          <span className="rating-star">⭐</span>
        </div>
      </div>

      <div className="review-card-body">
        <h5 className="review-title">{review.title || 'Untitled Review'}</h5>
        <p className="review-comment">{review.comment}</p>
      </div>

      {isOwner && (
        <div className="review-card-footer">
          <div className="owner-badge">
            <span className="badge-icon"></span>
            Your Review
          </div>
          <div className="review-actions">
            <Link
              to={`/review/edit/${review.id}`}
              state={{ 
                review,
                restaurant: {
                  id: review.placeId,
                  name: review.restaurantName
                }
              }}
              className="btn-edit"
            >
              <span className="btn-icon"></span>
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="btn-delete"
              >
                <span className="btn-icon"></span>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;