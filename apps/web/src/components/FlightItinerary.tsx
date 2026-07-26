'use client';

import { findAirport } from '../data/airports';
import type { NormalizedSegment, SegmentAmenities } from '../lib/flight';
import { AirlineLogo } from './AirlineLogo';

const carrierNames: Record<string, string> = {
  BA: 'British Airways',
  EK: 'Emirates',
  VS: 'Virgin Atlantic',
  FR: 'Ryanair',
  EZY: 'easyJet',
  U2: 'easyJet',
  W3: 'Arik Air',
  QR: 'Qatar Airways',
  AF: 'Air France',
  KL: 'KLM',
  LH: 'Lufthansa',
  TK: 'Turkish Airlines',
  PK: 'Pakistan International',
  EY: 'Etihad Airways',
  SQ: 'Singapore Airlines',
};

function airlineName(code: string) {
  return carrierNames[code.toUpperCase()] ?? code.toUpperCase();
}

function flightNumberLabel(carrier: string, flightNumber: string) {
  const code = carrier.trim().toUpperCase();
  const number = flightNumber.trim();
  if (!number) return code;
  if (number.toUpperCase().startsWith(code)) return number.toUpperCase();
  return `${code} ${number}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function fmtDuration(min: number) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function dayOffsetLabel(departIso: string, arriveIso: string) {
  const depart = new Date(departIso);
  const arrive = new Date(arriveIso);
  const start = Date.UTC(depart.getFullYear(), depart.getMonth(), depart.getDate());
  const end = Date.UTC(arrive.getFullYear(), arrive.getMonth(), arrive.getDate());
  const days = Math.round((end - start) / 86_400_000);
  if (days <= 0) return null;
  return `⁺${days}`;
}

function placeTitle(code: string, terminal?: string) {
  const airport = findAirport(code);
  const city = airport?.city.replace(/\(.*?\)/g, '').trim() ?? code;
  const terminalLabel = terminal ? ` Terminal ${terminal.replace(/^T/i, '')}` : '';
  return `${city} (${code})${terminalLabel}`;
}

function placeSubtitle(code: string) {
  const airport = findAirport(code);
  if (!airport || /all airports/i.test(airport.name)) return null;
  return airport.name;
}

function layoverMinutes(a: NormalizedSegment, b: NormalizedSegment) {
  return Math.max(
    0,
    Math.round((new Date(b.departAt).getTime() - new Date(a.arriveAt).getTime()) / 60000),
  );
}

type AmenityIcon =
  | 'aircraft'
  | 'meal'
  | 'wifi'
  | 'power'
  | 'seat'
  | 'entertainment'
  | 'baggage'
  | 'layout'
  | 'generic';

type AmenityItem = {
  key: string;
  icon: AmenityIcon;
  label: string;
};

function isSpecified(label?: string | null) {
  return Boolean(label && label !== 'Not specified by airline');
}

function amenityItems(aircraft?: string, amenities?: SegmentAmenities): AmenityItem[] {
  const list: AmenityItem[] = [];
  if (aircraft) {
    list.push({ key: 'aircraft', icon: 'aircraft', label: aircraft });
  }
  if (!amenities) return list;

  if (isSpecified(amenities.meal.label)) {
    list.push({ key: 'meal', icon: 'meal', label: `Meal · ${amenities.meal.label}` });
  }
  if (isSpecified(amenities.wifi.label)) {
    list.push({ key: 'wifi', icon: 'wifi', label: `Wi‑Fi · ${amenities.wifi.label}` });
  }
  if (isSpecified(amenities.power.label)) {
    list.push({ key: 'power', icon: 'power', label: `Power · ${amenities.power.label}` });
  }
  if (isSpecified(amenities.seat.label)) {
    list.push({ key: 'seat', icon: 'seat', label: amenities.seat.label });
  }
  return list;
}

function AmenityIconMark({ icon }: { icon: AmenityIcon }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    className: 'flight-itin-amenity-svg',
    'aria-hidden': true as const,
  };

  switch (icon) {
    case 'aircraft':
      return (
        <svg {...common}>
          <path
            d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h0A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'meal':
      return (
        <svg {...common}>
          <path
            d="M4.5 3.5v7.2c0 1.2.9 2.2 2.1 2.3V20.5h1.7v-7.5c1.2-.1 2.1-1.1 2.1-2.3V3.5H11V10c0 .5-.3.9-.7 1.1V3.5H8.7v7.6c-.4-.2-.7-.6-.7-1.1V3.5H6.5v7.6c-.4-.2-.7-.6-.7-1.1V3.5H4.5Zm10.2 0v9.4c0 1.5 1.1 2.7 2.5 2.9v4.7h1.7V3.5h-1.7v8.2h-1.1V3.5h-1.4Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'wifi':
      return (
        <svg {...common}>
          <path
            d="M12 18.2a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7Zm-4.05-3.15a5.7 5.7 0 0 1 8.1 0l-1.25 1.25a3.95 3.95 0 0 0-5.6 0l-1.25-1.25Zm-2.9-2.9a9.8 9.8 0 0 1 13.9 0l-1.25 1.25a8.05 8.05 0 0 0-11.4 0L5.05 12.15Zm-2.9-2.9A13.9 13.9 0 0 1 12 5.5c3.7 0 7.05 1.45 9.55 3.75L20.3 10.5A12.15 12.15 0 0 0 12 7.25c-3.2 0-6.1 1.25-8.3 3.25L3.15 9.25Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'power':
      return (
        <svg {...common}>
          <path
            d="M11 2.5h2v5.2h-2V2.5Zm4.95 2.2 1.45 1.4-3.55 3.55-1.4-1.45 3.5-3.5ZM5.6 4.7l3.5 3.5-1.4 1.45L4.15 6.1 5.6 4.7ZM8.5 12.25c0-1.95 1.55-3.5 3.5-3.5s3.5 1.55 3.5 3.5c0 1.35-.75 2.5-1.85 3.1V21.5h-3.3v-6.15c-1.1-.6-1.85-1.75-1.85-3.1Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'seat':
      return (
        <svg {...common}>
          <path
            d="M8.2 4.2c0-1 .8-1.8 1.8-1.8h4c1 0 1.8.8 1.8 1.8v5.4H8.2V4.2Zm-2.1 7.1h11.8c.85 0 1.55.7 1.55 1.55v.9c0 .85-.7 1.55-1.55 1.55H17.3v3.9h-1.8v-3.9H8.5v3.9H6.7v-3.9H6.1c-.85 0-1.55-.7-1.55-1.55v-.9c0-.85.7-1.55 1.55-1.55Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'entertainment':
      return (
        <svg {...common}>
          <path
            d="M4.5 6.5h15A1.5 1.5 0 0 1 21 8v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16V8a1.5 1.5 0 0 1 1.5-1.5Zm5.2 2.4v5.2l4.8-2.6-4.8-2.6ZM8 19h8v1.5H8V19Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'baggage':
      return (
        <svg {...common}>
          <path
            d="M9.2 3.8h5.6c.55 0 1 .45 1 1V6h3.1c.9 0 1.6.7 1.6 1.6v10.1c0 .9-.7 1.6-1.6 1.6H5.1c-.9 0-1.6-.7-1.6-1.6V7.6c0-.9.7-1.6 1.6-1.6H8.2V4.8c0-.55.45-1 1-1Zm1.2 2.2h3.2V5h-3.2v1Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'layout':
      return (
        <svg {...common}>
          <path
            d="M4.5 5.5h3.2v13H4.5v-13Zm6 0h3v13h-3v-13Zm6 0h3.2v13H16.5v-13Z"
            fill="currentColor"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path
            d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Zm0 3.2c-.55 0-1 .45-1 1v4.1c0 .55.45 1 1 1s1-.45 1-1V7.7c0-.55-.45-1-1-1Zm0 8.3a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

function AmenityList({
  aircraft,
  amenities,
}: {
  aircraft?: string;
  amenities?: SegmentAmenities;
}) {
  const list = amenityItems(aircraft, amenities);
  if (!list.length) return null;

  return (
    <ul className="flight-itin-amenities">
      {list.map((item) => (
        <li key={item.key}>
          <span className="flight-itin-amenity-icon" aria-hidden>
            <AmenityIconMark icon={item.icon} />
          </span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

function SegmentBlock({
  segment,
  cabinLabel,
}: {
  segment: NormalizedSegment;
  cabinLabel?: string;
}) {
  const name = airlineName(segment.carrier);
  const flight = flightNumberLabel(segment.carrier, segment.flightNumber);
  const cabin = segment.cabinMarketingName || cabinLabel || 'Economy';
  const arriveOffset = dayOffsetLabel(segment.departAt, segment.arriveAt);
  const techStops = segment.stops ?? [];
  const originSub = placeSubtitle(segment.origin);
  const destSub = placeSubtitle(segment.destination);

  return (
    <article className="flight-itin-segment">
      <div className="flight-itin-times">
        <div className="flight-itin-time-block">
          <span className="flight-itin-clock">{fmtTime(segment.departAt)}</span>
          <span className="flight-itin-day">{fmtDay(segment.departAt)}</span>
        </div>
        <span className="flight-itin-leg-duration">{fmtDuration(segment.durationMin)}</span>
        <div className="flight-itin-time-block">
          <span className="flight-itin-clock">
            {fmtTime(segment.arriveAt)}
            {arriveOffset ? <sup className="flight-itin-plus">{arriveOffset}</sup> : null}
          </span>
          <span className="flight-itin-day">{fmtDay(segment.arriveAt)}</span>
        </div>
      </div>

      <div className="flight-itin-rail" aria-hidden>
        <span className="flight-itin-dot" />
        <span className="flight-itin-line" />
        <span className="flight-itin-dot is-end" />
      </div>

      <div className="flight-itin-body">
        <div className="flight-itin-place">
          <p className="flight-itin-place-title">
            {placeTitle(segment.origin, segment.originTerminal)}
          </p>
          {originSub ? <p className="flight-itin-place-sub">{originSub}</p> : null}
        </div>

        <div className="flight-itin-carrier">
          <AirlineLogo code={segment.carrier} name={name} size={34} />
          <div className="min-w-0">
            <p className="flight-itin-carrier-name">{name}</p>
            <p className="flight-itin-carrier-meta">
              {cabin} · {flight}
              {segment.operatingCarrier && segment.operatingCarrier !== segment.carrier
                ? ` · Op. ${airlineName(segment.operatingCarrier)}`
                : ''}
            </p>
          </div>
        </div>

        <div className="flight-itin-place">
          <p className="flight-itin-place-title">
            {placeTitle(segment.destination, segment.destinationTerminal)}
          </p>
          {destSub ? <p className="flight-itin-place-sub">{destSub}</p> : null}
        </div>

        {techStops.map((stop) => (
          <div key={`${stop.airport}-${stop.arriveAt}`} className="flight-itin-tech">
            Technical stop in {stop.airport} · {fmtDuration(stop.durationMin)} · arrive{' '}
            {fmtTime(stop.arriveAt)}, depart {fmtTime(stop.departAt)}
          </div>
        ))}
      </div>

      <AmenityList amenities={segment.amenities} aircraft={segment.aircraft} />
    </article>
  );
}

export function FlightItinerary({
  segments,
  cabinLabel,
}: {
  segments: NormalizedSegment[];
  cabinLabel?: string;
}) {
  return (
    <div className="flight-itin">
      {segments.map((segment, index) => {
        const next = segments[index + 1];
        const layover = next ? layoverMinutes(segment, next) : 0;
        return (
          <div key={`${segment.carrier}-${segment.flightNumber}-${segment.departAt}-${index}`}>
            <SegmentBlock segment={segment} cabinLabel={cabinLabel} />
            {next ? (
              <div className="flight-itin-layover">
                <span>
                  {fmtDuration(layover)} layover · {placeTitle(segment.destination)}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
