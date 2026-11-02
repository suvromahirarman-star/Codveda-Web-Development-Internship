import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherDetails from './components/WeatherDetails';
import ForecastList from './components/ForecastList';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { searchCity, fetchWeatherData } from './services/weatherApi';

/**
 * App Component
 * Root component orchestrating application state, side effects, and child components.
 *
 * Demonstrates:
 * - State management via useState (city, weather, loading, error, location)
 * - Lifecycle and data-fetching via useEffect
 * - Props passing down the component tree
 * - Race-condition prevention via request ID tracking
 * - Reference-based framed glass canvas architecture
 */
export default function App() {
  const [location, setLocation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCity, setActiveCity] = useState('London');

  // Request tracker to prevent stale responses from overwriting newer searches
  const latestRequestId = useRef(0);

  /**
   * Fetches coordinates and meteorological data for a designated city.
   * @param {string} cityName
   */
  async function loadCityWeather(cityName) {
    if (!cityName || !cityName.trim()) {
      setError('Please provide a valid city name.');
      return;
    }

    const currentReq = ++latestRequestId.current;
    setLoading(true);
    setError(null);

    try {
      // Step 1: Geocoding lookup via Open-Meteo
      const locData = await searchCity(cityName);

      // Check if another search was triggered while awaiting geocoding
      if (currentReq !== latestRequestId.current) return;

      // Step 2: Atmospheric forecast lookup via Open-Meteo
      const weatherData = await fetchWeatherData(
        locData.latitude,
        locData.longitude,
        locData.timezone
      );

      // Verify request is still active
      if (currentReq !== latestRequestId.current) return;

      setLocation(locData);
      setCurrentWeather(weatherData.current);
      setForecast(weatherData.daily);
      setActiveCity(locData.name);
    } catch (err) {
      if (currentReq === latestRequestId.current) {
        setError(err.message || 'Unable to retrieve weather data.');
      }
    } finally {
      if (currentReq === latestRequestId.current) {
        setLoading(false);
      }
    }
  }

  // Effect: Fetch initial default city upon mount
  useEffect(() => {
    loadCityWeather('London');

    return () => {
      // Invalidate in-flight requests on unmount
      latestRequestId.current += 1;
    };
  }, []);

  const handleSearch = (newCity) => {
    loadCityWeather(newCity);
  };

  const handleRefresh = () => {
    loadCityWeather(activeCity);
  };

  const handleRetry = () => {
    loadCityWeather(activeCity || 'London');
  };

  return (
    <div className="dashboard-app-shell">
      {/* Accessible Skip Link */}
      <a href="#main-dashboard" className="skip-link">
        Skip to weather dashboard content
      </a>

      {/* Outer Viewport Wrapper Providing the Reference's Misty Atmospheric Backdrop */}
      <div className="app-viewport-wrapper">
        {/* The Signature Framed Glass Canvas (Matching the reference's rounded window enclosure) */}
        <div className="app-canvas-frame">
          {/* Header with Navigation and Telemetry Action */}
          <Header onRefresh={handleRefresh} isLoading={loading} />

          <main id="main-dashboard" className="dashboard-main">
            <div className="dashboard-inner-container">
              {/* City Search Bar & Quick Presets */}
              <SearchBar onSearch={handleSearch} isLoading={loading} />

              {/* Error Banner */}
              {error && <ErrorState message={error} onRetry={handleRetry} />}

              {/* Loading Indicator */}
              {loading && !currentWeather && <LoadingState />}

              {/* Weather Content when data is present */}
              {currentWeather && location && (
                <div className={`dashboard-content ${loading ? 'is-refreshing' : ''}`}>
                  {/* Reference-Based Split Hero Display */}
                  <CurrentWeather
                    location={location}
                    current={currentWeather}
                    todayForecast={forecast[0]}
                    onRefresh={handleRefresh}
                    isLoading={loading}
                  />

                  {/* Secondary Detail Metrics */}
                  <WeatherDetails current={currentWeather} />

                  {/* 5-Day Forecast Strip */}
                  <ForecastList daily={forecast} timezone={location.timezone} />
                </div>
              )}
            </div>
          </main>

          {/* Framed Canvas Footer */}
          <footer className="dashboard-footer">
            <div className="footer-inner">
              <p className="footer-credits">
                Powered by the free <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo Meteorological API</a>. Satellite telemetry without API keys.
              </p>
              <p className="footer-internship">
                Codveda Web Development Internship &bull; Level 2, Task 2: React Framework
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
