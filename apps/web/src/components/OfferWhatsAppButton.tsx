'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { WhatsAppChannelIcon } from './ContactChannelIcons';
import type { NormalizedOffer, TravellerSummary } from '../lib/flight';
import { buildSelectedOfferWhatsAppUrl, getWhatsAppLines } from '../lib/whatsapp';

type Variant = 'primary' | 'bar';

export function OfferWhatsAppButton({
  offer,
  travellers,
  variant = 'primary',
}: {
  offer: NormalizedOffer;
  travellers?: TravellerSummary;
  variant?: Variant;
}) {
  const lines = getWhatsAppLines();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const compact = variant === 'bar';

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!lines.length) return null;

  const primaryHref = buildSelectedOfferWhatsAppUrl(offer, travellers, lines[0]!.digits);
  if (!primaryHref) return null;

  const btnClass = `offer-whatsapp-btn${compact ? ' is-bar' : ''}`;
  const label = (
    <>
      <span className="offer-whatsapp-btn-icon-wrap" aria-hidden="true">
        <WhatsAppChannelIcon className="offer-whatsapp-btn-icon" />
      </span>
      <span className="offer-whatsapp-btn-copy">
        <span className="offer-whatsapp-btn-title">
          {compact ? 'Chat to book' : 'Chat to book this flight'}
        </span>
        {compact ? null : (
          <span className="offer-whatsapp-btn-hint">Itinerary sent automatically</span>
        )}
      </span>
      <span className="offer-whatsapp-btn-arrow" aria-hidden="true">
        →
      </span>
    </>
  );

  if (lines.length === 1) {
    return (
      <a
        href={primaryHref}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        data-whatsapp-cta="booking"
      >
        {label}
      </a>
    );
  }

  return (
    <div ref={rootRef} className={`offer-whatsapp${open ? ' is-open' : ''}${compact ? ' is-bar' : ''}`}>
      <button
        type="button"
        className={btnClass}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      {open ? (
        <div id={menuId} className="offer-whatsapp-menu" role="menu">
          {lines.map((line) => {
            const href = buildSelectedOfferWhatsAppUrl(offer, travellers, line.digits);
            if (!href) return null;
            return (
              <a
                key={line.digits}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="offer-whatsapp-option"
                data-whatsapp-cta="booking"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className="offer-whatsapp-option-label">{line.label}</span>
                <span className="offer-whatsapp-option-value">
                  <span aria-hidden="true">🇬🇧</span>
                  {line.display}
                </span>
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
