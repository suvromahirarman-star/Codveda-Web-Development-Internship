/**
 * weatherHelpers.js
 * Utility functions for mapping WMO weather codes, formatting dates,
 * and generating accessible inline SVG weather icons.
 */

/**
 * Maps WMO weather interpretation codes to readable descriptions and icon names.
 * Standard WMO codes reference: https://open-meteo.com/en/docs
 */
export function getWeatherDetails(code, isDay = true) {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        iconType: isDay ? 'sun' : 'moon'
      };
    case 1:
      return {
        label: 'Mainly Clear',
        iconType: isDay ? 'sun-cloud' : 'moon-cloud'
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconType: isDay ? 'sun-cloud' : 'moon-cloud'
      };
    case 3:
      return {
        label: 'Overcast',
        iconType: 'cloud'
      };
    case 45:
    case 48:
      return {
        label: 'Fog & Depositing Rime',
        iconType: 'fog'
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        iconType: 'drizzle'
      };
    case 61:
    case 63:
    case 65:
      return {
        label: 'Rain',
        iconType: 'rain'
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconType: 'freezing-rain'
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: 'Snow Fall',
        iconType: 'snow'
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        iconType: 'rain'
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconType: 'snow'
      };
    case 95:
      return {
        label: 'Thunderstorm',
        iconType: 'thunderstorm'
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm with Hail',
        iconType: 'thunderstorm-hail'
      };
    default:
      return {
        label: 'Variable Conditions',
        iconType: 'cloud'
      };
  }
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a human-readable local date.
 * e.g., "Tuesday, Oct 14, 2026"
 */
export function formatFullDate(isoString, timezone = 'UTC') {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats an ISO date string into a compact weekday label.
 * e.g., "Mon", "Tue", "Wed", or "Today"
 */
export function formatDayLabel(isoString, index = 0, timezone = 'UTC') {
  if (index === 0) return 'Today';
  try {
    const date = new Date(isoString + 'T12:00:00Z');
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone
    }).format(date);
  } catch {
    return isoString;
  }
}

