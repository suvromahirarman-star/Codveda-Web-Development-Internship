import React from 'react';

/**
 * Header Component
 * Inspired by the reference top navigation:
 * - Brand identity on the left
 * - Clean section links in the center
 * - Telemetry status badge & high-contrast white action pill button on the right
 *
 * @param {Object} props
 * @param {Function} props.onRefresh - Callback to re-fetch weather data.
 * @param {boolean} props.isLoading - Whether a request is active.
 */
export default function Header({ onRefresh, isLoading }) {
  return (
    <header className="dashboard-header" role="banner">
      <div className="brand-group">
        <div className="logo-symbol" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        </div>
        <div className="brand-text-wrap">
          <span className="brand-name">
            ATMOS<span className="brand-accent">.WEATHER</span>
          </span>
          <span className="brand-tagline">Open-Meteo Satellite Feed</span>
        </div>
      </div>

      {/* Reference-Inspired Center Navigation Links */}
      <nav className="header-nav" aria-label="Main navigation">
        <a href="#current-weather" className="nav-link is-active">Overview</a>
        <a href="#weather-details" className="nav-link">Telemetry</a>
        <a href="#forecast-section" className="nav-link">5-Day Outlook</a>
        <a href="#quick-presets" className="nav-link">Global Stations</a>
      </nav>

      {/* Right Controls: Telemetry Badge & Reference White Action Pill */}
      <div className="header-status-group">
        <div className="api-badge" title="Live meteorological telemetry without API keys">
          <span className="badge-pulse" aria-hidden="true"></span>
          <span className="badge-text">Telemetry Active</span>
        </div>

        <button
          type="button"
          className="btn-header-action"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh live meteorological telemetry"
        >
          <span className={`refresh-icon-spin ${isLoading ? 'spinning' : ''}`} aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </span>
          <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
}
