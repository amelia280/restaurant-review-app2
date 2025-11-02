// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || 'User');
        setUserEmail(user.email || '');
      } else {
        setUserName('');
        setUserEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to log out. Please try again.');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="sidebar-toggle d-lg-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        {/* Logo/Brand */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <span className="logo-icon"></span>
            <span className="logo-text">Restaurant Reviews</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="sidebar-nav">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon"></span>
              <span className="nav-text">Home</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/my-reviews" 
              className={`nav-link ${isActive('/my-reviews') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon"></span>
              <span className="nav-text">My Reviews</span>
            </Link>
          </li>
        </ul>

        {/* User Profile Section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar"></div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              {userEmail && (
                <div className="user-email">{userEmail}</div>
              )}
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <span className="logout-icon"></span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;