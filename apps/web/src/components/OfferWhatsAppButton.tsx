'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { WhatsAppChannelIcon } from './ContactChannelIcons';
import type { NormalizedOffer, TravellerSummary } from '../lib/flight';
import {
  buildSelectedOfferWhatsAppUrl,
  getWhatsAppLines,
} from '../lib/whatsapp';

export function OfferWhatsAppButton({
  offer,
  travellers,
}: {
  offer: NormalizedOffer;
  travellers?: TravellerSummary;
}) {
  const lines = getWhatsAppLines();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  if (lines.length === 1) {
    return (
      <a
        href={primaryHref}
        target="_blank"
        rel="noopener noreferrer"
        className="offer-whatsapp-btn"
      >
        <WhatsAppChannelIcon className="offer-whatsapp-btn-icon" />
        WhatsApp this flight
      </a>
    );
  }

  return (
    <div ref={rootRef} className={`offer-whatsapp${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="offer-whatsapp-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <WhatsAppChannelIcon className="offer-whatsapp-btn-icon" />
        WhatsApp this flight
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
