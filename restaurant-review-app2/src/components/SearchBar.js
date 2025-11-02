// src/components/SearchBar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex w-100">
      <input
        type="text"
        className="form-control me-2"
        placeholder="Search restaurants worldwide (e.g., 'pizza in Rome', 'KFC in Tokyo')..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search restaurants globally"
      />
      <button className="btn btn-outline-success" type="submit">
        Search
      </button>
    </form>
  );
};

export default SearchBar;