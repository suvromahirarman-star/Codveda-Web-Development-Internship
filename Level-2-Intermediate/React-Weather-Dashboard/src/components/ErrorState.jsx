import React from 'react';

/**
 * ErrorState Component
 * Displays user-friendly error feedback with an action button to retry or reset.
 *
 * @param {Object} props
 * @param {string} props.message - Error explanation.
 * @param {Function} props.onRetry - Callback to attempt recovery.
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-card" role="alert" aria-live="assertive">
      <div className="error-icon-wrap" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="error-content">
        <h3 className="error-title">Unable to Retrieve Meteorological Data</h3>
        <p className="error-description">
          {message || 'An unexpected communication error occurred with the Open-Meteo satellite feed.'}
        </p>

        <div className="error-actions">
          {onRetry && (
            <button type="button" className="btn-retry" onClick={onRetry}>
              <span>Retry Search</span>
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

