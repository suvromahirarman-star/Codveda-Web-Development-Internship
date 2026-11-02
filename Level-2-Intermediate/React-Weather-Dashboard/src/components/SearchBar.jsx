import React, { useState } from 'react';

/**
 * SearchBar Component
 * Controlled form input with Enter-key support and quick-city presets.
 * Styled with reference-inspired frosted glass, electric cyan focus ring, and clean pills.
 *
 * @param {Object} props
 * @param {Function} props.onSearch - Callback invoked when a search is triggered with city name.
 * @param {boolean} props.isLoading - Whether a search request is actively loading.
 */
export default function SearchBar({ onSearch, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const quickCities = ['London', 'Tokyo', 'New York', 'Paris', 'Dubai', 'Sydney'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  const handleQuickSelect = (city) => {
    setSearchTerm(city);
    onSearch(city);
  };

  return (
    <section className="search-section" aria-label="City search form">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search global city or coordinates (e.g., Tokyo, Oslo, Zurich)..."
            aria-label="Search city weather"
            disabled={isLoading}
            autoComplete="off"
          />

          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search input"
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn-search"
          disabled={isLoading || !searchTerm.trim()}
          aria-label="Search weather for city"
        >
          <span>{isLoading ? 'Searching...' : 'Explore Weather'}</span>
          <span className="btn-arrow" aria-hidden="true">&rarr;</span>
        </button>
      </form>

      {/* Quick City Presets */}
      <div id="quick-presets" className="quick-cities" aria-label="Quick city presets">
        <span className="quick-label">Global Stations:</span>
        <div className="quick-tags">
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              className="quick-city-btn"
              onClick={() => handleQuickSelect(city)}
              disabled={isLoading}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
