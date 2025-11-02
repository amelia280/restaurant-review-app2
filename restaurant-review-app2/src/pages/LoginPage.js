// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error("Sign in failed:", error);
      
      // User-friendly error messages
      switch (error.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please check your credentials and try again.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!displayName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (displayName.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
      
      alert('✅ Account created successfully! Welcome!');
      navigate('/');
    } catch (error) {
      console.error("Sign up failed:", error);
      
      // User-friendly error messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please sign in or use a different email.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password sign-up is not enabled. Please contact support.');
          break;
        default:
          setError('Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h1 className="display-4 mb-2">🍽️</h1>
                  <h2 className="h3 fw-bold">Restaurant Reviews</h2>
                  <p className="text-muted">
                    {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>⚠️ Error:</strong> {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                  {/* Name field - only for sign up */}
                  {isSignUp && (
                    <div className="mb-3">
                      <label htmlFor="displayName" className="form-label fw-semibold">
                        Full Name *
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Enter your full name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={50}
                      />
                    </div>
                  )}

                  {/* Email field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Password field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                    />
                    {isSignUp && (
                      <small className="text-muted d-block mt-1">
                        Must be at least 6 characters long
                      </small>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Please wait...
                      </>
                    ) : (
                      <>
                        {isSignUp ? '✅ Create Account' : 'Log in'}
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle between Sign In / Sign Up */}
                <div className="text-center">
                  <hr className="my-4" />
                  <p className="text-muted mb-2">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={toggleMode}
                    disabled={loading}
                  >
                    {isSignUp ? 'Sign In Instead' : 'Create New Account'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-center mt-4">
              <small className="text-muted">
                🔒 Your data is secured with Firebase Authentication
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;