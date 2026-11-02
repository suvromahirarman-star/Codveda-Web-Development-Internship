import React from 'react';

/**
 * LoadingState Component
 * Accessible loading indicator with pulsating radar effect and skeleton layout.
 */
export default function LoadingState() {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="radar-spinner" aria-hidden="true">
        <div className="radar-circle circle-1"></div>
        <div className="radar-circle circle-2"></div>
        <div className="radar-circle circle-3"></div>
      </div>
      <p className="loading-text">Retrieving Atmospheric Telemetry from Open-Meteo...</p>

      {/* Skeleton placeholders */}
      <div className="skeleton-grid" aria-hidden="true">
        <div className="skeleton-card skeleton-hero"></div>
        <div className="skeleton-card skeleton-metrics"></div>
        <div className="skeleton-card skeleton-forecast"></div>
      </div>
    </div>
  );
}

