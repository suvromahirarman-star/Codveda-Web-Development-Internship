import React from 'react';

/**
 * WeatherDetails Component
 * Displays 4 individual translucent glass parameter cards:
 * Humidity, Wind Speed, Thermal Sensation, and Precipitation.
 *
 * @param {Object} props
 * @param {Object} props.current - Current meteorological metrics.
 */
export default function WeatherDetails({ current }) {
  if (!current) return null;

  const metrics = [
    {
      id: 'humidity',
      label: 'Relative Humidity',
      value: `${current.humidity}%`,
      hint: current.humidity > 70 ? 'High Moisture' : 'Comfortable',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      )
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      value: `${current.windSpeed} km/h`,
      hint: current.windSpeed > 25 ? 'Breezy / Strong' : 'Calm / Gentle',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      )
    },
    {
      id: 'apparent',
      label: 'Thermal Sensation',
      value: `${current.apparentTemperature}°C`,
      hint: 'Apparent Temp',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      )
    },
    {
      id: 'precipitation',
      label: 'Precipitation',
      value: `${current.precipitation} mm`,
      hint: current.precipitation > 0 ? 'Active Surface Rain' : 'No Rain Detected',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
          <path d="M8 19v2" />
          <path d="M8 13v2" />
          <path d="M16 19v2" />
          <path d="M16 13v2" />
          <path d="M12 21v2" />
          <path d="M12 15v2" />
        </svg>
      )
    }
  ];

  return (
    <section id="weather-details" className="weather-details-section" aria-label="Detailed meteorological parameters">
      <div className="section-header-row">
        <h3 className="section-title">Atmospheric Parameters</h3>
        <span className="section-badge">Live Sensor Readings</span>
      </div>

      <div className="metrics-grid">
        {metrics.map((item) => (
          <div key={item.id} className="metric-card">
            <div className="metric-header">
              <span className="metric-icon" aria-hidden="true">{item.icon}</span>
              <span className="metric-label">{item.label}</span>
            </div>
            <div className="metric-value-wrap">
              <span className="metric-main-value">{item.value}</span>
              <span className="metric-hint">{item.hint}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
