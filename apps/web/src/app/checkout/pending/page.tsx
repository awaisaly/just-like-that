'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  getPrimaryWhatsAppLine,
  getSupportEmail,
  supportMailtoHref,
  whatsappChatHref,
} from '../../../lib/contact';
import { useCheckoutStore } from '../../../lib/stores';
import { buildWhatsAppUrl } from '../../../lib/whatsapp';

const supportEmail = getSupportEmail();
const whatsappFallback = getPrimaryWhatsAppLine();
const whatsappFallbackHref = whatsappFallback
  ? whatsappChatHref(whatsappFallback.digits)
  : null;

function PendingInner() {
  const params = useSearchParams();
  const reference = params.get('ref');
  const selection = useCheckoutStore((s) => s.selection);
  const hasHydrated = useCheckoutStore((s) => s.hasHydrated);

  const whatsappUrl =
    hasHydrated && reference && selection
      ? buildWhatsAppUrl(reference, selection.offer)
      : null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="card stack text-center">
        <h1>Request received</h1>
        <p>
          Thanks — a booking agent will call you shortly
          {reference ? (
            <>
              {' '}
              about request <strong>{reference}</strong>
            </>
          ) : null}
          .
        </p>
        <p className="muted text-sm">
          No booking or payment has been created yet. Your representative will re-check the fare
          and finalise everything by phone.
        </p>

        <div className="grid gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#25D366] px-6 py-3 font-bold text-white transition hover:bg-[#1ebe57]"
            >
              Message us on WhatsApp
            </a>
          ) : whatsappFallbackHref ? (
            <a
              href={whatsappFallbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#25D366] px-6 py-3 font-bold text-white transition hover:bg-[#1ebe57]"
            >
              Message us on WhatsApp
            </a>
          ) : null}
          <a
            href={supportMailtoHref(supportEmail)}
            className="rounded-xl border border-line px-6 py-3 font-semibold text-brand-navy transition hover:bg-surface"
          >
            Email {supportEmail}
          </a>
          <Link href="/flights/search" className="text-sm font-semibold text-brand hover:underline">
            Search another flight
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white" />}>
      <PendingInner />
    </Suspense>
  );
}
