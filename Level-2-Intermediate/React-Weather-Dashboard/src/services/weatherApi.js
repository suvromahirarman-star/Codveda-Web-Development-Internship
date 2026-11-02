/**
 * weatherApi.js
 * Service module for querying the Open-Meteo Geocoding and Forecast APIs.
 * Uses safe URL and URLSearchParams to prevent unescaped parameter injection.
 */

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Searches for coordinates and metadata for a given city name.
 * @param {string} cityName - The name of the city to search.
 * @returns {Promise<Object>} Geocoding result containing latitude, longitude, and location names.
 */
export async function searchCity(cityName) {
  const query = cityName ? cityName.trim() : '';

  if (!query) {
    throw new Error('Please enter a city name to search.');
  }

  const url = new URL(GEOCODING_BASE_URL);
  url.searchParams.set('name', query);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Geocoding service unavailable (HTTP ${response.status}).`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Location "${query}" was not found. Please check the spelling and try again.`);
  }

  const location = data.results[0];

  return {
    name: location.name,
    country: location.country || '',
    countryCode: location.country_code || '',
    admin1: location.admin1 || '',
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone || 'auto'
  };
}

/**
 * Fetches current weather and 5-day forecast for given coordinates.
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} timezone
 * @returns {Promise<Object>} Formatted current weather and daily forecast array.
 */
export async function fetchWeatherData(latitude, longitude, timezone = 'auto') {
  const url = new URL(FORECAST_BASE_URL);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('timezone', timezone);
  url.searchParams.set('forecast_days', '5');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Weather forecast service unavailable (HTTP ${response.status}).`);
  }

  const data = await response.json();

  if (!data.current || !data.daily) {
    throw new Error('Malformed response received from weather service.');
  }

  // Format the 5-day forecast into an easily consumable array of day objects
  const forecastList = data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily.weather_code[index],
    maxTemp: Math.round(data.daily.temperature_2m_max[index]),
    minTemp: Math.round(data.daily.temperature_2m_min[index])
  }));

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      isDay: data.current.is_day === 1,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      time: data.current.time
    },
    daily: forecastList,
    timezone: data.timezone || timezone
  };
}

