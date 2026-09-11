'use client';

import Link from 'next/link';
import { formatMoney } from '@jlt/shared';
import { findAirport } from '../data/airports';
import type { NormalizedOffer, TravellerSummary } from '../lib/flight';
import { INSTALMENTS_HREF, instalmentCopy } from '../lib/instalments';
import { payableFare } from '../lib/pricing';
import { FareBreakdown } from './FareBreakdown';
import { InstalmentPhrase } from './InstalmentAccent';
import { OfferWhatsAppButton } from './OfferWhatsAppButton';

const STEPS = [
  {
    n: '1',
    title: 'WhatsApp opens with this flight',
    body: 'Route, dates, and fare are already in the message.',
  },
  {
    n: '2',
    title: 'A UK agent confirms it',
    body: 'We re-price, hold the ticket, and stay with you.',
  },
  {
    n: '3',
    title: 'Pay before you fly',
    body: 'Instalments or in full — every payment before departure.',
  },
] as const;

export function OfferBookingCard({
  offer,
  travellers,
}: {
  offer: NormalizedOffer;
  travellers?: TravellerSummary;
}) {
  const summary = routeSummary(offer, travellers);

  return (
    <aside className="offer-booking" aria-label="Book this flight on WhatsApp">
      <p className="offer-booking-eyebrow">Ready to book</p>
      <p className="offer-booking-route">
        {summary.origin} <span aria-hidden="true">→</span> {summary.destination}
      </p>
      <p className="offer-booking-meta">{summary.meta}</p>

      <div className="offer-booking-price">
        <FareBreakdown price={offer.price} payment="installments" headline />
        {offer.price.serviceFee && offer.price.serviceFee.amount > 0 ? (
          <p className="mt-2 text-xs text-muted">
            Pay in full: {formatMoney(payableFare(offer.price, 'full'))} (no service fee)
          </p>
        ) : null}
        <p className="instalment-price-note mt-1.5">{instalmentCopy.priceNote}</p>
      </div>

      <div className="offer-booking-cta">
        <OfferWhatsAppButton offer={offer} travellers={travellers} />
        <p className="offer-booking-cta-note">
          Opens WhatsApp with a UK agent. We don’t take payment on this website.
        </p>
      </div>

      <ol className="offer-booking-steps">
        {STEPS.map((step) => (
          <li key={step.n} className="offer-booking-step">
            <span className="offer-booking-step-n" aria-hidden="true">
              {step.n}
            </span>
            <span>
              <span className="offer-booking-step-title">{step.title}</span>
              <span className="offer-booking-step-body">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="offer-booking-instalment">
        <p className="m-0 text-sm font-extrabold text-brand-navy">
          <InstalmentPhrase>{instalmentCopy.motto}</InstalmentPhrase>
        </p>
        <Link href={INSTALMENTS_HREF} className="offer-booking-instalment-link">
          How instalments work →
        </Link>
      </div>
    </aside>
  );
}

export function OfferBookingBar({
  offer,
  travellers,
}: {
  offer: NormalizedOffer;
  travellers?: TravellerSummary;
}) {
  const summary = routeSummary(offer, travellers);
  const total = formatMoney(payableFare(offer.price, 'installments'));

  return (
    <div className="offer-booking-bar" role="region" aria-label="Book this flight on WhatsApp">
      <div className="offer-booking-bar-price">
        <p className="offer-booking-bar-amount">{total}</p>
        <p className="offer-booking-bar-route">
          {summary.origin} → {summary.destination}
        </p>
      </div>
      <OfferWhatsAppButton offer={offer} travellers={travellers} variant="bar" />
    </div>
  );
}

function routeSummary(offer: NormalizedOffer, travellers?: TravellerSummary) {
  const outbound = offer.slices[0]?.segments ?? [];
  const inbound = offer.slices[1]?.segments ?? [];
  const first = outbound[0];
  const lastOut = outbound[outbound.length - 1];
  const lastIn = inbound[inbound.length - 1];

  const origin = cityName(first?.origin ?? '');
  const destination = cityName(lastOut?.destination ?? first?.destination ?? '');
  const depart = first ? formatDay(first.departAt) : '';
  const ret = inbound[0] ? formatDay(inbound[0].departAt) : lastIn ? formatDay(lastIn.arriveAt) : '';
  const dates = ret ? `${depart} – ${ret}` : depart;
  const people = travellersLabel(travellers);
  const cabin = cabinLabel(offer.cabin);
  const meta = [dates, people, cabin].filter(Boolean).join(' · ');

  return { origin, destination, meta };
}

function cityName(code: string) {
  if (!code) return '—';
  const airport = findAirport(code);
  const city = airport?.city.replace(/\(.*?\)/g, '').trim();
  return city || code;
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function travellersLabel(travellers?: TravellerSummary) {
  if (!travellers) return '';
  const parts: string[] = [];
  if (travellers.adults) {
    parts.push(`${travellers.adults} adult${travellers.adults === 1 ? '' : 's'}`);
  }
  if (travellers.children) {
    parts.push(`${travellers.children} child${travellers.children === 1 ? '' : 'ren'}`);
  }
  if (travellers.infants) {
    parts.push(`${travellers.infants} infant${travellers.infants === 1 ? '' : 's'}`);
  }
  return parts.join(', ');
}

function cabinLabel(cabin: string) {
  return cabin
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
