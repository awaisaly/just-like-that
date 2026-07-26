import { formatMoney } from '@jlt/shared';
import { AGENCY_NAME } from './brand';
import { getWhatsAppChatUrl, getWhatsAppLines, whatsappChatHref } from './contact';
import type { NormalizedOffer, TravellerSummary } from './flight';

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function cabinLabel(cabin: string): string {
  return cabin
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sliceSummary(offer: NormalizedOffer, sliceIndex: number): string {
  const slice = offer.slices[sliceIndex];
  if (!slice?.segments.length) return '';
  const first = slice.segments[0]!;
  const last = slice.segments[slice.segments.length - 1]!;
  const flights = slice.segments
    .map((segment) => `${segment.carrier}${segment.flightNumber}`)
    .join(', ');
  const label = sliceIndex === 0 ? 'Outbound' : 'Return';
  return [
    `${label}: ${first.origin} → ${last.destination}`,
    `  Depart ${formatWhen(first.departAt)}`,
    `  Arrive ${formatWhen(last.arriveAt)}`,
    `  Flights: ${flights}`,
  ].join('\n');
}

/** Prefilled WhatsApp message for a selected offer (before/without callback reference). */
export function buildSelectedOfferWhatsAppMessage(
  offer: NormalizedOffer,
  travellers?: TravellerSummary,
): string {
  const first = offer.slices[0]?.segments[0];
  const lastSlice = offer.slices[offer.slices.length - 1];
  const last = lastSlice?.segments[lastSlice.segments.length - 1];
  const route = `${first?.origin ?? '—'} → ${last?.destination ?? '—'}`;

  const lines = [
    `Hi, I’m interested in this flight on ${AGENCY_NAME}.`,
    '',
    `Route: ${route}`,
    `Displayed fare: ${formatMoney(offer.price.total)} (indicative)`,
    `Cabin: ${cabinLabel(offer.cabin)}`,
  ];

  if (travellers) {
    lines.push(
      `Travellers: ${travellers.adults} adult(s), ${travellers.children} child(ren), ${travellers.infants} infant(s)`,
    );
  }

  if (offer.fareBrand) lines.push(`Fare brand: ${offer.fareBrand}`);
  lines.push(`Offer ID: ${offer.providerOfferId}`);
  lines.push('');
  offer.slices.forEach((_, index) => {
    const summary = sliceSummary(offer, index);
    if (summary) lines.push(summary, '');
  });
  lines.push(
    'Please help me confirm availability and booking — I’d like to book now and pay in instalments (all paid before I fly), or pay in full.',
  );

  return lines.filter((line, index, all) => !(line === '' && all[index - 1] === '')).join('\n');
}

export function buildSelectedOfferWhatsAppUrl(
  offer: NormalizedOffer,
  travellers?: TravellerSummary,
  digits?: string,
): string | null {
  const message = buildSelectedOfferWhatsAppMessage(offer, travellers);
  if (digits) return whatsappChatHref(digits, message);
  return getWhatsAppChatUrl(message);
}

export function buildWhatsAppUrl(reference: string, offer: NormalizedOffer): string | null {
  const first = offer.slices[0]?.segments[0];
  const lastSlice = offer.slices[offer.slices.length - 1];
  const last = lastSlice?.segments[lastSlice.segments.length - 1];
  const route = `${first?.origin ?? '—'} to ${last?.destination ?? '—'}`;
  const message = [
    `Hi, I requested a callback on ${AGENCY_NAME}.`,
    `Reference: ${reference}`,
    `Route: ${route}`,
    `Displayed fare: ${formatMoney(offer.price.total)}`,
    `Please call me back to confirm availability and booking.`,
  ].join('\n');

  return getWhatsAppChatUrl(message);
}

export { getWhatsAppLines };
