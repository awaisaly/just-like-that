import { formatMoney } from '@jlt/shared';
import { AGENCY_NAME } from './brand';
import type { NormalizedOffer } from './flight';

export function buildWhatsAppUrl(reference: string, offer: NormalizedOffer): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, '');
  if (!raw) return null;

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

  return `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
}
