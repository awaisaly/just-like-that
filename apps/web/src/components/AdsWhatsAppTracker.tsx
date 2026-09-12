'use client';

import { useEffect } from 'react';
import {
  getGoogleAdsId,
  getWhatsAppConversionId,
  isWhatsAppHref,
  whatsappCtaSource,
} from '../lib/ads-tracking';

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

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') return;
  window.gtag = function gtag() {
    // Same queue format as the official gtag snippet.
    window.dataLayer!.push(arguments);
  };
}

function sendWhatsAppLeadOnce(anchor: HTMLAnchorElement) {
  const href = anchor.href || anchor.getAttribute('href') || '';
  const now = Date.now();
  if (href && href === lastHref && now - lastSentAt < DEDUPE_MS) return;
  lastHref = href;
  lastSentAt = now;

  ensureGtag();

  const source = whatsappCtaSource(anchor);
  const adsId = getGoogleAdsId();
  const conversionId = getWhatsAppConversionId();

  // Recommended lead event — shows up in Google Ads as a Google-tag event
  // you can turn into a conversion if you have not created a click action yet.
  const leadParams: Record<string, unknown> = {
    method: 'whatsapp',
    currency: 'GBP',
    source,
  };
  if (adsId) leadParams.send_to = adsId;
  window.gtag!('event', 'generate_lead', leadParams);

  // Official Ads click conversion (needs AW-…/label from a Click action).
  if (conversionId) {
    window.gtag!('event', 'conversion', {
      send_to: conversionId,
    });
  }
}

/**
 * Industry pattern for WhatsApp: fire a lead event on every wa.me click
 * (booking card, floating chip, header, footer). One hit per click.
 * Do not also add a GTM Google Ads conversion tag for the same click.
 */
export function AdsWhatsAppTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = findWhatsAppAnchor(event.target);
      if (!anchor) return;
      sendWhatsAppLeadOnce(anchor);
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
