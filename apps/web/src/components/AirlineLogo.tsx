'use client';

import { useState } from 'react';
import { airlineLogoUrl } from '../lib/airline';

const fallbackColors: Record<string, string> = {
  BA: '#1d3d84',
  EK: '#d71a21',
  VS: '#e10a0a',
  FR: '#073590',
  EZY: '#ff6600',
  U2: '#ff6600',
  W3: '#c8102e',
  QR: '#5c0632',
  AF: '#002157',
  KL: '#00a1de',
  LH: '#05164d',
  TK: '#c70a0c',
};

export function AirlineLogo({
  code,
  name,
  size = 44,
  className = '',
}: {
  code: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const iata = code.trim().toUpperCase();
  const label = name ?? iata;

  if (!iata || failed) {
    return (
      <div
        className={`airline-logo is-fallback ${className}`.trim()}
        style={{
          width: size,
          height: size,
          background: fallbackColors[iata] ?? '#1668e3',
        }}
        aria-label={label}
        title={label}
      >
        <span>{iata.slice(0, 2) || '?'}</span>
      </div>
    );
  }

  return (
    <div
      className={`airline-logo ${className}`.trim()}
      style={{ width: size, height: size }}
      title={label}
    >
      {/* Duffel SVGs — plain img avoids Next image SVG restrictions */}
      <img
        src={airlineLogoUrl(iata)}
        alt={label}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/** Generic mark for multi-airline / codeshare connecting itineraries. */
export function MultiAirlineMark({
  size = 44,
  label = 'Multiple airlines',
  className = '',
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`airline-logo is-multi ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 40 40" width={size * 0.78} height={size * 0.78} aria-hidden="true">
        {/* Rear plane */}
        <g fill="currentColor" opacity="0.38" transform="translate(-1 6)">
          <path d="M8.5 18.2 5.2 19.6l.6 1.35 3.6-.95 2.9 3.2h1.9l-1.35-3.9 4.5-1.2-.95-1.15-6.7 1.8-1.3-2.9Z" />
        </g>
        {/* Front plane */}
        <g fill="currentColor">
          <path d="M14.2 14.4 9.5 16.5l.9 2 4.8-1.4 4 4.5h2.4l-1.9-5.5 6.2-1.7-1.35-1.65-9.3 2.55-1.85-4.05Z" />
        </g>
        {/* Plus mark — signals multiple carriers */}
        <path
          d="M29.2 26.4h-2.1v-2.1h-1.5v2.1h-2.1v1.5h2.1v2.1h1.5v-2.1h2.1v-1.5Z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

/** Single airline logo, or a generic multi-plane mark for mixed-carrier trips. */
export function AirlineLogoStack({
  codes,
  names,
  size = 44,
  showName = true,
}: {
  codes: string[];
  names?: Record<string, string>;
  size?: number;
  showName?: boolean;
}) {
  const unique = [...new Set(codes.map((c) => c.trim().toUpperCase()).filter(Boolean))];
  if (!unique.length) {
    return <AirlineLogo code="" size={size} />;
  }

  if (unique.length === 1) {
    const code = unique[0]!;
    const name = names?.[code] ?? code;
    const logo = <AirlineLogo code={code} name={name} size={size} />;
    if (!showName) return logo;
    return (
      <div className="airline-brand">
        {logo}
        <span className="airline-brand-name">{name}</span>
      </div>
    );
  }

  const label = unique.map((code) => names?.[code] ?? code).join(' · ');
  const mark = <MultiAirlineMark size={size} label={`Multiple airlines · ${label}`} />;
  if (!showName) return mark;
  return (
    <div className="airline-brand">
      {mark}
      <span className="airline-brand-name">Multiple airlines</span>
    </div>
  );
}
