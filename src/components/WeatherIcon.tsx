import type {WeatherIconKind} from '../types/app';

interface WeatherIconProps {
  kind: WeatherIconKind;
  className?: string;
}

export function WeatherIcon({kind, className = 'w-6 h-6'}: WeatherIconProps) {
  switch (kind) {
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="5.6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
          <g stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="4.2" />
            <line x1="12" y1="19.8" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4.2" y2="12" />
            <line x1="19.8" y1="12" x2="22" y2="12" />
            <line x1="4.9" y1="4.9" x2="6.5" y2="6.5" />
            <line x1="17.5" y1="17.5" x2="19.1" y2="19.1" />
            <line x1="19.1" y1="4.9" x2="17.5" y2="6.5" />
            <line x1="6.5" y1="17.5" x2="4.9" y2="19.1" />
          </g>
        </svg>
      );

    case 'partly-cloudy':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="8.6" cy="9" r="4.5" fill="#FBBF24" />
          <g stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round">
            <line x1="8.6" y1="2.2" x2="8.6" y2="3.4" />
            <line x1="2" y1="9" x2="3.2" y2="9" />
            <line x1="3.9" y1="4.3" x2="4.8" y2="5.2" />
            <line x1="13.3" y1="4.3" x2="12.4" y2="5.2" />
          </g>
          <path
            d="M8.5 19.5h8.8a3.7 3.7 0 0 0 .4-7.38 4.8 4.8 0 0 0-9.2-1.12A3.8 3.8 0 0 0 8.5 19.5Z"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="0.9"
          />
        </svg>
      );

    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            d="M6.8 18.8h10.5a4.2 4.2 0 0 0 .5-8.37 5.5 5.5 0 0 0-10.58-1.28A4.4 4.4 0 0 0 6.8 18.8Z"
            fill="#CBD5E1"
            stroke="#64748B"
            strokeWidth="1"
          />
        </svg>
      );

    case 'rain':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            d="M6.6 15.2h10.8a3.8 3.8 0 0 0 .45-7.57 5 5 0 0 0-9.65-1.15A4 4 0 0 0 6.6 15.2Z"
            fill="#94A3B8"
            stroke="#475569"
            strokeWidth="0.9"
          />
          <path
            d="M8 17.2c-.8 1.4-1.3 2.3-1.3 3a1.3 1.3 0 0 0 2.6 0c0-.7-.5-1.6-1.3-3Zm4.2 0c-.8 1.4-1.3 2.3-1.3 3a1.3 1.3 0 0 0 2.6 0c0-.7-.5-1.6-1.3-3Zm4.2 0c-.8 1.4-1.3 2.3-1.3 3a1.3 1.3 0 0 0 2.6 0c0-.7-.5-1.6-1.3-3Z"
            fill="#38BDF8"
          />
        </svg>
      );

    case 'snow':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            d="M6.6 14.8h10.8a3.7 3.7 0 0 0 .45-7.37 4.9 4.9 0 0 0-9.65-1.15A3.9 3.9 0 0 0 6.6 14.8Z"
            fill="#CBD5E1"
            stroke="#64748B"
            strokeWidth="0.9"
          />
          <circle cx="8" cy="19.2" r="1.6" fill="#A5F3FC" />
          <circle cx="12.2" cy="20.4" r="1.6" fill="#E0F2FE" />
          <circle cx="16.4" cy="19.2" r="1.6" fill="#A5F3FC" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            d="M6.8 18.8h10.5a4.2 4.2 0 0 0 .5-8.37 5.5 5.5 0 0 0-10.58-1.28A4.4 4.4 0 0 0 6.8 18.8Z"
            fill="#CBD5E1"
          />
        </svg>
      );
  }
}
