import React from 'react';
import ForecastCard from './ForecastCard';

/**
 * ForecastList Component
 * Container for the 5-day daily forecast outlook strip.
 * Demonstrates: Rendering lists with Array.prototype.map() and stable keys.
 *
 * @param {Object} props
 * @param {Array} props.daily - Array of 5 daily forecast objects.
 * @param {string} props.timezone - Timezone of the active location.
 */
export default function ForecastList({ daily, timezone }) {
  if (!daily || daily.length === 0) return null;

  return (
    <section id="forecast-section" className="forecast-section" aria-labelledby="forecast-heading">
      <div className="section-header-row">
        <h3 id="forecast-heading" className="section-title">
          5-Day Atmospheric Outlook
        </h3>
        <span className="section-badge">Open-Meteo High &amp; Low Bounds</span>
      </div>

      <div className="forecast-grid">
        {daily.map((day, index) => (
          <ForecastCard
            key={day.date}
            date={day.date}
            weatherCode={day.weatherCode}
            maxTemp={day.maxTemp}
            minTemp={day.minTemp}
            index={index}
            timezone={timezone}
          />
        ))}
      </div>
    </section>
  );
}
