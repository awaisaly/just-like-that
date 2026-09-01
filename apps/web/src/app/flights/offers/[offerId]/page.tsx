'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatMoney } from '@jlt/shared';
import { apiFetch } from '../../../../lib/api';
import type { NormalizedOffer } from '../../../../lib/flight';
import { isMockOfferId } from '../../../../lib/flight';
import { INSTALMENTS_HREF, instalmentCopy } from '../../../../lib/instalments';
import { useCheckoutStore } from '../../../../lib/stores';
import { FlightItinerary } from '../../../../components/FlightItinerary';
import { InstalmentPhrase } from '../../../../components/InstalmentAccent';
import { OfferWhatsAppButton } from '../../../../components/OfferWhatsAppButton';

export default function OfferDetailPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const router = useRouter();
  const selection = useCheckoutStore((state) => state.selection);
  const selectOffer = useCheckoutStore((state) => state.selectOffer);
  const hasHydrated = useCheckoutStore((state) => state.hasHydrated);
  const [offer, setOffer] = useState<NormalizedOffer | null>(selection?.offer ?? null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selection?.offer.providerOfferId === offerId) {
      setOffer(selection.offer);
    }
  }, [selection, offerId]);

  useEffect(() => {
    if (!hasHydrated || !offerId || isMockOfferId(offerId)) return;
    const current = useCheckoutStore.getState().selection;
    if (!current || current.offer.providerOfferId !== offerId) return;

    let cancelled = false;
    (async () => {
      setRefreshing(true);
      try {
        const data = await apiFetch<{ offer: NormalizedOffer }>(
          `/api/flights/offers/${encodeURIComponent(offerId)}`,
        );
        if (cancelled) return;
        setOffer(data.offer);
        const travellers = useCheckoutStore.getState().selection?.travellers;
        if (travellers) selectOffer(data.offer, travellers);
      } catch {
        // Keep session selection if the live offer refresh fails.
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, offerId, selectOffer]);

  if (!hasHydrated) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white" />;
  }

  if (!offer || offer.providerOfferId !== offerId) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="card stack">
          <h1>Flight selection expired</h1>
          <p className="text-muted">
            Flight details are kept only for this browser session. Search again to refresh the
            latest fares.
          </p>
          <Link
            href="/flights/search"
            className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Search flights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-left text-sm font-semibold text-brand hover:underline"
      >
        ← Back to results
      </button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="m-0">Flight details</h1>
        {refreshing ? (
          <p className="m-0 text-xs font-semibold text-muted">Refreshing live fare details…</p>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="card stack">
          {offer.slices.map((slice, sliceIndex) => (
            <section key={sliceIndex}>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
                <h2 className="m-0 text-base">{sliceIndex === 0 ? 'Outbound' : 'Return'}</h2>
              </div>
              <FlightItinerary segments={slice.segments} cabinLabel={cabinLabel(offer.cabin)} />
            </section>
          ))}

          <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            <Info label="Cabin baggage" value={offer.baggage.carryOn} />
            <Info label="Checked baggage" value={offer.baggage.checked} />
            <Info
              label="Meal"
              value={offer.amenities?.meal.label ?? 'Not specified by airline'}
            />
            <Info
              label="Wi‑Fi"
              value={offer.amenities?.wifi.label ?? 'Not specified by airline'}
            />
            <Info
              label="Power"
              value={offer.amenities?.power.label ?? 'Not specified by airline'}
            />
            <Info
              label="Seat"
              value={offer.amenities?.seat.label ?? 'Not specified by airline'}
            />
            <Info label="Refundable" value={offer.conditions.refundable ? 'Yes' : 'No'} />
            <Info label="Changeable" value={offer.conditions.changeable ? 'Yes' : 'No'} />
            {offer.fareBrand ? <Info label="Fare brand" value={offer.fareBrand} /> : null}
            <Info label="Cabin" value={cabinLabel(offer.cabin)} />
          </div>
        </div>

        <aside
          className="card stack lg:sticky"
          style={{ top: 'calc(var(--site-chrome-height, 6.5rem) + 0.75rem)' }}
        >
          <div>
            <div className="price">{formatMoney(offer.price.total)}</div>
            <p className="text-xs text-muted">indicative fare · incl. taxes and fees</p>
            <p className="instalment-price-note mt-1.5">{instalmentCopy.priceNote}</p>
          </div>
          <div className="rounded-xl border border-accent/25 bg-[#fff7f2] px-3 py-2.5">
            <p className="m-0 text-base font-bold text-brand-navy">
              <InstalmentPhrase>{instalmentCopy.motto}</InstalmentPhrase>
            </p>
            <p className="mt-0.5 text-xs text-muted">Our primary way to book</p>
            <Link
              href={INSTALMENTS_HREF}
              className="mt-1 inline-block text-xs font-bold text-accent hover:text-accent-dark"
            >
              How instalments work →
            </Link>
          </div>
          <div className="grid gap-1 border-t border-line pt-3 text-sm">
            <Row label="Base fare" value={formatMoney(offer.price.base)} />
            <Row label="Taxes & fees" value={formatMoney(offer.price.taxes)} />
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-accent py-3.5 text-base font-bold text-white transition hover:bg-accent-dark"
            onClick={() => router.push('/checkout')}
          >
            {instalmentCopy.ctaPrimary}
          </button>
          <OfferWhatsAppButton offer={offer} travellers={selection?.travellers} />
          <p className="text-center text-xs text-muted">{instalmentCopy.offerNote}</p>
        </aside>
      </div>
    </div>
  );
}

function cabinLabel(cabin: string): string {
  return cabin
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
