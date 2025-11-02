// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import MyReviewsPage from './pages/MyReviewsPage';
import WriteReviewPage from './pages/WriteReviewPage';
import LoginPage from './pages/LoginPage';
import AuthRoute from './components/AuthRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route: Login is visible */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — wrapped with AuthRoute + Navbar */}
        <Route
          path="/"
          element={
            <AuthRoute>
              <>
                <Navbar />
                <HomePage />
              </>
            </AuthRoute>
          }
        />
        <Route
          path="/search"
          element={
            <AuthRoute>
              <>
                <Navbar />
                <SearchResultsPage />
              </>
            </AuthRoute>
          }
        />
        <Route
          path="/restaurant/:placeId"
          element={
            <AuthRoute>
              <>
                <Navbar />
                <RestaurantDetailPage />
              </>
            </AuthRoute>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <AuthRoute>
              <>
                <Navbar />
                <MyReviewsPage />
              </>
            </AuthRoute>
          }
        />
        <Route
          path="/review/new/:placeId"
          element={
            <AuthRoute>
              <>
                <Navbar />
                <WriteReviewPage />
              </>
            </AuthRoute>
          }
        />
        <Route
          path="/review/edit/:reviewId"
          element={
            <AuthRoute>
              <>
                <Navbar />
                <WriteReviewPage />
              </>
            </AuthRoute>
          }
        />

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;