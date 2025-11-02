import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import './WriteReviewPage.css';

const WriteReviewPage = () => {
  const { placeId: urlPlaceId, reviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [restaurantName, setRestaurantName] = useState('this restaurant');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [finalPlaceId, setFinalPlaceId] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  /* ----------  auth  ---------- */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setCurrentUser(u);
      if (!u) navigate('/login');
    });
    return () => unsub();
  }, [navigate]);

  /* ----------  Initialize placeId and restaurant info  ---------- */
  useEffect(() => {
    const initialize = async () => {
      // For new review - get placeId from URL and restaurant from state
      if (urlPlaceId && !reviewId) {
        setFinalPlaceId(urlPlaceId);
        if (location.state?.restaurant) {
          setRestaurantName(location.state.restaurant.name);
        }
        setIsInitializing(false);
        return;
      }

      // For editing - load review and get placeId from it
      if (reviewId) {
        setIsEditing(true);
        try {
          const snap = await getDoc(doc(db, 'reviews', reviewId));
          if (snap.exists()) {
            const d = snap.data();
            setTitle(d.title || '');
            setComment(d.comment || '');
            setRating(d.rating || 5);
            setRestaurantName(d.restaurantName || 'this restaurant');
            setFinalPlaceId(d.placeId);
          }
        } catch (error) {
          console.error('Error loading review:', error);
        }
        setIsInitializing(false);
        return;
      }

      // If we got here with no valid placeId, redirect
      setIsInitializing(false);
    };

    initialize();
  }, [urlPlaceId, reviewId, location.state, navigate]);

  /* ----------  Redirect if invalid after initialization  ---------- */
  useEffect(() => {
    if (!isInitializing && (!finalPlaceId || finalPlaceId === 'undefined')) {
      console.error('Invalid placeId, redirecting to search');
      navigate('/search', { replace: true });
    }
  }, [isInitializing, finalPlaceId, navigate]);

  /* ----------  submit  ---------- */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) return alert('You must be logged in.');
    if (!finalPlaceId || finalPlaceId === 'undefined') {
      alert('Invalid restaurant.');
      return navigate('/search');
    }

    setLoading(true);
    const reviewData = {
      title: title.trim(),
      comment: comment.trim(),
      rating: parseInt(rating, 10),
      placeId: finalPlaceId,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email || 'Anonymous',
      userEmail: currentUser.email,
      restaurantName,
      updatedAt: new Date()
    };

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'reviews', reviewId), reviewData);
      } else {
        await addDoc(collection(db, 'reviews'), { 
          ...reviewData, 
          createdAt: new Date() 
        });
      }
      navigate(`/restaurant/${finalPlaceId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save review.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || isInitializing) {
    return (
      <div className="writereview-page-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="writereview-page-container">
      <div className="container">
        <div className="glass-card">
          <h2 className="mb-2" style={{color:'var(--primary-dark)'}}>
            {isEditing ? 'Edit Review' : 'Write a Review'}
          </h2>
          <p className="text-muted mb-1">
            For: <strong>{restaurantName}</strong>
          </p>
          <p className="text-muted small mb-4">
            Posting as: <strong>{currentUser.displayName || currentUser.email || 'User'}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Review Title</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g., Great food and atmosphere!" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                maxLength={100} 
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Rating</label>
              <select 
                className="form-select" 
                value={rating} 
                onChange={e => setRating(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n} {'⭐'.repeat(n)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Your Review</label>
              <textarea 
                className="form-control" 
                rows="6" 
                placeholder="Share your experience..." 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                required 
                minLength={10} 
              />
              <small className="text-muted">Minimum 10 characters</small>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-save" 
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditing ? 'Update Review' : 'Submit Review'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-cancel" 
                onClick={() => navigate(-1)} 
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewPage;