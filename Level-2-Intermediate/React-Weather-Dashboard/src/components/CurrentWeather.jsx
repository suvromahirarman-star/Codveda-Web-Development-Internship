import React from 'react';
import WeatherIcon from './WeatherIcon';
import { getWeatherDetails, formatFullDate } from '../utils/weatherHelpers';

/**
 * CurrentWeather Component
 * Recreates the visual composition of the reference:
 * - Left column: Monumental 3-line editorial typography (solid/frosted/solid), contextual description,
 *   and satellite trust badge with warm golden star.
 * - Right column: Floating translucent glass telemetry card mirroring the reference booking card
 *   (location title, dual selection pills, dual metric boxes, large stat row, and white action pill button).
 *
 * @param {Object} props
 * @param {Object} props.location - Location metadata (name, country, admin1, timezone).
 * @param {Object} props.current - Current weather metrics from Open-Meteo.
 * @param {Object} [props.todayForecast] - Today's high and low temperatures.
 * @param {Function} [props.onRefresh] - Callback to refresh weather data.
 * @param {boolean} [props.isLoading] - Loading state flag.
 */
export default function CurrentWeather({ location, current, todayForecast, onRefresh, isLoading }) {
  if (!location || !current) return null;

  const { label } = getWeatherDetails(current.weatherCode, current.isDay);
  const formattedDate = formatFullDate(current.time, location.timezone);

  return (
    <article id="current-weather" className="reference-hero-section" aria-labelledby="hero-city-title">
      {/* ------------------------------------------------------------------
          Left Column: Monumental Editorial Typography & Telemetry Trust
          ------------------------------------------------------------------ */}
      <div className="hero-editorial-col">
        <div className="editorial-eyebrow">
          <span className="eyebrow-dot" aria-hidden="true"></span>
          <span className="eyebrow-text">Active Telemetry Station</span>
        </div>

        <h1 id="hero-city-title" className="editorial-title">
          <span className="title-line title-solid">{location.name}</span>
          <span className="title-line title-frosted">
            {current.temperature}&deg;C {label}
          </span>
          <span className="title-line title-solid">
            {location.admin1 ? `${location.admin1}, ` : ''}{location.country || 'Global'}
          </span>
        </h1>

        <p className="hero-description">
          Real-time atmospheric tracking and precision satellite telemetry delivered via open meteorological feeds. Unplug, monitor, and connect with global microclimate patterns.
        </p>

        {/* Reference-Inspired Trust & Rating Badge with Warm Amber Glow */}
        <div className="hero-trust-badge" aria-label="Station rating and telemetry stats">
          <div className="trust-star-wrap" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="trust-score">4.9</span>
          </div>
          <span className="trust-divider" aria-hidden="true">&bull;</span>
          <span className="trust-meta">from 1,800+ stations worldwide</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          Right Column: Floating Translucent Glass Telemetry Card
          (Directly inspired by the Evergreen Pine Family Lodge card)
          ------------------------------------------------------------------ */}
      <div className="hero-floating-card-col">
        <div className="floating-telemetry-card">
          {/* Card Header: Station Name & Circular Action Icon */}
          <div className="floating-card-header">
            <div className="floating-title-group">
              <h2 className="floating-card-title">{location.name} Telemetry</h2>
              <span className="floating-card-subtitle">{label}</span>
            </div>

            <button
              type="button"
              className="btn-card-icon"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh telemetry"
              aria-label="Refresh telemetry"
            >
              <svg
                className={isLoading ? 'spinning' : ''}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
          </div>

          {/* Weather Icon Centerpiece with Ambient Glow */}
          <div className="floating-card-visual" aria-hidden="true">
            <div className="visual-glow-backdrop"></div>
            <WeatherIcon
              code={current.weatherCode}
              isDay={current.isDay}
              size={72}
              className="floating-hero-svg"
            />
          </div>

          {/* Dual Segmented Input/Metric Pills (matching reference date pickers) */}
          <div className="dual-pills-row" aria-label="Current date and wind metrics">
            <div className="glass-pill-item">
              <span className="pill-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <span className="pill-val">{formattedDate.split(',')[0]}</span>
              <span className="pill-arrow" aria-hidden="true">&bull;</span>
            </div>

            <div className="glass-pill-item">
              <span className="pill-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                </svg>
              </span>
              <span className="pill-val">{current.windSpeed} km/h</span>
              <span className="pill-arrow" aria-hidden="true">&bull;</span>
            </div>
          </div>

          {/* Dual Sub-Cards (matching reference check-in/check-out boxes) */}
          <div className="dual-subcards-row">
            <div className="subcard-box">
              <span className="subcard-label">Relative Humidity</span>
              <span className="subcard-value">{current.humidity}%</span>
              <span className="subcard-hint">{current.humidity > 70 ? 'High Moisture' : 'Comfortable'}</span>
            </div>

            <div className="subcard-box">
              <span className="subcard-label">Thermal Sensation</span>
              <span className="subcard-value">{current.apparentTemperature}&deg;C</span>
              <span className="subcard-hint">Feels Like</span>
            </div>
          </div>

          {/* Price / Temperature Stat Row */}
          <div className="floating-stat-row">
            <div className="stat-main-cluster">
              <span className="stat-hero-temp">{current.temperature}&deg;</span>
              <span className="stat-unit-label">C</span>
              <span className="stat-sub-text">
                {current.precipitation > 0 ? `Rain: ${current.precipitation} mm` : 'Clear Surface'}
              </span>
            </div>

            {todayForecast && (
              <div className="stat-range-cluster">
                <span className="stat-range-high">High {todayForecast.maxTemp}&deg;</span>
                <span className="stat-range-low">Low {todayForecast.minTemp}&deg;</span>
              </div>
            )}
          </div>

          {/* Reference Signature White Full-Width Pill Action Button */}
          <button
            type="button"
            className="btn-card-reserve"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh telemetry data"
          >
            <span>{isLoading ? 'Updating Station...' : 'Refresh Telemetry'}</span>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </article>
  );
}
