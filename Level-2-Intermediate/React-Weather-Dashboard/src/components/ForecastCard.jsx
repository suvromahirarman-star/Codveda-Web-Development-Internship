import React from 'react';
import WeatherIcon from './WeatherIcon';
import { getWeatherDetails, formatDayLabel } from '../utils/weatherHelpers';

/**
 * ForecastCard Component
 * Renders an individual day's forecast block within the 5-day outlook.
 *
 * Demonstrates: Props consumption, computed labels, and clean component isolation.
 *
 * @param {Object} props
 * @param {string} props.date - ISO date string (YYYY-MM-DD).
 * @param {number} props.weatherCode - WMO weather code.
 * @param {number} props.maxTemp - High temperature in °C.
 * @param {number} props.minTemp - Low temperature in °C.
 * @param {number} props.index - Day index (0 = today, 1 = tomorrow, etc.).
 * @param {string} props.timezone - Target location timezone.
 */
export default function ForecastCard({ date, weatherCode, maxTemp, minTemp, index, timezone }) {
  const { label } = getWeatherDetails(weatherCode, true);
  const dayName = formatDayLabel(date, index, timezone);

  return (
    <article className="forecast-card" aria-label={`Weather forecast for ${dayName}: ${label}`}>
      <div className="forecast-card-top">
        <span className={`forecast-day ${index === 0 ? 'is-today' : ''}`}>{dayName}</span>
        <span className="forecast-condition-name">{label}</span>
      </div>

      <div className="forecast-icon-wrap">
        <WeatherIcon code={weatherCode} isDay={true} size={42} />
      </div>

      <div className="forecast-temp-range">
        <div className="temp-high">
          <span className="temp-val">{maxTemp}&deg;</span>
          <span className="temp-sublabel">High</span>
        </div>
        <div className="temp-divider" aria-hidden="true"></div>
        <div className="temp-low">
          <span className="temp-val">{minTemp}&deg;</span>
          <span className="temp-sublabel">Low</span>
        </div>
      </div>
    </article>
  );
}

