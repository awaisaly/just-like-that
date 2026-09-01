'use client';

import { useEffect } from 'react';
import { getWhatsAppConversionId, isWhatsAppHref } from '../lib/ads-tracking';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const DEDUPE_MS = 1500;
let lastHref = '';
let lastSentAt = 0;

function findWhatsAppAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest('a');
  if (!anchor || !isWhatsAppHref(anchor.getAttribute('href'))) return null;
  return anchor;
}

function sendWhatsAppConversionOnce(href: string, conversionId: string) {
  if (!conversionId) return;

  const now = Date.now();
  if (href === lastHref && now - lastSentAt < DEDUPE_MS) return;
  lastHref = href;
  lastSentAt = now;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      // Same queue format as the official gtag snippet.
      window.dataLayer!.push(arguments);
    };
  }
  window.gtag('event', 'conversion', { send_to: conversionId });
}

/** Fires the Google Ads WhatsApp click conversion once per click (not via GTM). */
export function AdsWhatsAppTracker() {
  const conversionId = getWhatsAppConversionId();

  useEffect(() => {
    if (!conversionId) return;

    function onClick(event: MouseEvent) {
      const anchor = findWhatsAppAnchor(event.target);
      if (!anchor) return;
      sendWhatsAppConversionOnce(anchor.href || anchor.getAttribute('href') || '', conversionId);
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [conversionId]);

  return null;
}
