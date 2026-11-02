import React from 'react';
import { getWeatherDetails } from '../utils/weatherHelpers';

/**
 * WeatherIcon component renders clean, vector SVG weather symbols.
 * Styled with the dashboard's electric cyan and soft violet palette.
 *
 * @param {Object} props
 * @param {number} props.code - The numerical WMO weather code.
 * @param {boolean} [props.isDay=true] - Day vs night indicator.
 * @param {number} [props.size=48] - Icon width and height in pixels.
 * @param {string} [props.className=''] - Optional CSS class.
 */
export default function WeatherIcon({ code, isDay = true, size = 48, className = '' }) {
  const { iconType, label } = getWeatherDetails(code, isDay);

  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: `weather-svg ${className}`,
    role: 'img',
    'aria-label': label
  };

  switch (iconType) {
    case 'sun':
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="14" fill="#36D9F7" fillOpacity="0.2" stroke="#36D9F7" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="8" fill="#F8FAFC" />
          <path d="M32 8V12M32 52V56M8 32H12M52 32H56M15.03 15.03L17.86 17.86M46.14 46.14L48.97 48.97M15.03 48.97L17.86 46.14M46.14 17.86L48.97 15.03"
            stroke="#36D9F7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'moon':
      return (
        <svg {...svgProps}>
          <path d="M38 18C28 20 22 28 22 38C22 44 25 49 29 52C20 52 14 44 14 34C14 22 24 14 36 14C37 14 39 14 40 15C39 16 38 17 38 18Z"
            fill="#9B8CFF" fillOpacity="0.25" stroke="#9B8CFF" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="44" cy="22" r="1.5" fill="#36D9F7" />
          <circle cx="48" cy="34" r="1.5" fill="#36D9F7" />
        </svg>
      );

    case 'sun-cloud':
      return (
        <svg {...svgProps}>
          <circle cx="24" cy="24" r="8" fill="#36D9F7" fillOpacity="0.3" stroke="#36D9F7" strokeWidth="2" />
          <path d="M46 44H24C19.58 44 16 40.42 16 36C16 31.8 19.22 28.36 23.36 28.04C24.64 22.38 29.82 18 36 18C43.18 18 49 23.82 49 31C51.84 31.5 54 33.98 54 37C54 40.86 50.86 44 47 44"
            fill="#1C293B" stroke="#9B8CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'moon-cloud':
      return (
        <svg {...svgProps}>
          <path d="M26 16C22 18 20 22 20 26C20 30 22 34 25 36C20 36 16 32 16 26C16 20 20 16 26 16Z"
            stroke="#9B8CFF" strokeWidth="2" fill="#9B8CFF" fillOpacity="0.2" />
          <path d="M46 44H24C19.58 44 16 40.42 16 36C16 31.8 19.22 28.36 23.36 28.04C24.64 22.38 29.82 18 36 18C43.18 18 49 23.82 49 31C51.84 31.5 54 33.98 54 37C54 40.86 50.86 44 47 44"
            fill="#1C293B" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'rain':
    case 'drizzle':
    case 'freezing-rain':
      return (
        <svg {...svgProps}>
          <path d="M46 38H24C19.58 38 16 34.42 16 30C16 25.8 19.22 22.36 23.36 22.04C24.64 16.38 29.82 12 36 12C43.18 12 49 17.82 49 25C51.84 25.5 54 27.98 54 31C54 34.86 50.86 38 47 38"
            fill="#1C293B" stroke="#36D9F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="44" x2="18" y2="52" stroke="#36D9F7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="32" y1="44" x2="28" y2="52" stroke="#36D9F7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="44" x2="38" y2="52" stroke="#36D9F7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'snow':
      return (
        <svg {...svgProps}>
          <path d="M46 36H24C19.58 36 16 32.42 16 28C16 23.8 19.22 20.36 23.36 20.04C24.64 14.38 29.82 10 36 10C43.18 10 49 15.82 49 23C51.84 23.5 54 25.98 54 29C54 32.86 50.86 36 47 36"
            fill="#1C293B" stroke="#9B8CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="46" r="2.5" fill="#36D9F7" />
          <circle cx="32" cy="46" r="2.5" fill="#36D9F7" />
          <circle cx="42" cy="46" r="2.5" fill="#36D9F7" />
        </svg>
      );

    case 'thunderstorm':
    case 'thunderstorm-hail':
      return (
        <svg {...svgProps}>
          <path d="M46 34H24C19.58 34 16 30.42 16 26C16 21.8 19.22 18.36 23.36 18.04C24.64 12.38 29.82 8 36 8C43.18 8 49 13.82 49 21C51.84 21.5 54 23.98 54 27C54 30.86 50.86 34 47 34"
            fill="#1C293B" stroke="#9B8CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M34 38L26 48H32L30 56L38 46H32L34 38Z" fill="#36D9F7" stroke="#36D9F7" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case 'fog':
      return (
        <svg {...svgProps}>
          <path d="M44 30H20C17.79 30 16 28.21 16 26C16 23.79 17.79 22 20 22C20.65 17.5 24.5 14 29.2 14C34.4 14 38.6 18 39 23.2C41.8 23.5 44 25.5 44 28"
            fill="#1C293B" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="16" y1="38" x2="48" y2="38" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="46" x2="44" y2="46" stroke="#36D9F7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'cloud':
    default:
      return (
        <svg {...svgProps}>
          <path d="M48 46H20C15.58 46 12 42.42 12 38C12 33.8 15.22 30.36 19.36 30.04C20.64 24.38 25.82 20 32 20C39.18 20 45 25.82 45 33C47.84 33.5 50 35.98 50 39C50 42.86 46.86 46 43 46"
            fill="#172338" stroke="#36D9F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

