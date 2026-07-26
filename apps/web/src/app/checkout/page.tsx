'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatMoney } from '@jlt/shared';
import { apiFetch } from '../../lib/api';
import {
  formatSupportPhone,
  getSupportPhone,
  supportTelHref,
} from '../../lib/contact';
import { INSTALMENTS_HREF, instalmentCopy } from '../../lib/instalments';
import { useCheckoutStore } from '../../lib/stores';

const supportPhone = getSupportPhone();
const supportPhoneDisplay = formatSupportPhone(supportPhone);

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredTime: string;
  paymentPreference: 'full' | 'installments';
  consent: boolean;
  company: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const selection = useCheckoutStore((s) => s.selection);
  const hasHydrated = useCheckoutStore((s) => s.hasHydrated);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredTime: 'Weekday mornings',
      paymentPreference: 'installments',
      consent: false,
      company: '',
    },
  });

  const pref = watch('paymentPreference');

  async function onSubmit(values: FormValues) {
    if (!selection) {
      setServerError('No flight selected');
      return;
    }
    if (!values.consent) {
      setServerError('Please confirm we can contact you about this request');
      return;
    }

    setServerError(null);
    try {
      const data = await apiFetch<{ reference: string }>('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          contact: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
          },
          preferredTime: values.preferredTime,
          paymentPreference: values.paymentPreference,
          travellers: selection.travellers,
          offer: selection.offer,
          consent: true,
          company: values.company,
        }),
      });

      router.push(
        `/checkout/pending?ref=${encodeURIComponent(data.reference)}&offer=${encodeURIComponent(selection.offer.providerOfferId)}`,
      );
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Callback request failed');
    }
  }

  if (!hasHydrated) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white" />;
  }

  if (!selection) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="card stack">
          <h1>Request a callback</h1>
          <p className="text-muted">Select a flight first, then we can arrange a callback.</p>
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

  const { offer, travellers } = selection;
  const seg = offer.slices[0]?.segments[0];

  return (
    <div className="stack">
      <h1>Book now · pay in instalments</h1>
      <p className="muted text-sm">
        No payment is taken online. A UK representative will re-check the fare, book your ticket,
        and set up instalments — all paid before you fly.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="stack">
          <div className="card stack">
            <h2 className="m-0">Talk to a booking agent</h2>
            <p className="text-sm text-muted">
              Prefer to talk now? Call{' '}
              <a href={supportTelHref(supportPhone)} className="font-bold text-brand">
                {supportPhoneDisplay}
              </a>{' '}
              — otherwise leave your details and we&apos;ll call you back.
            </p>
          </div>

          <div className="card stack">
            <h2 className="m-0">Your details</h2>
            {/* Honeypot — leave empty */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              {...register('company')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName?.message}>
                <input className="field-input" {...register('firstName', { required: 'Required' })} />
              </Field>
              <Field label="Last name" error={errors.lastName?.message}>
                <input className="field-input" {...register('lastName', { required: 'Required' })} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input
                  className="field-input"
                  type="email"
                  {...register('email', {
                    required: 'Required',
                    pattern: {
                      value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <input
                  className="field-input"
                  {...register('phone', {
                    required: 'Required',
                    minLength: { value: 7, message: 'Enter a valid phone' },
                  })}
                />
              </Field>
              <Field label="Preferred callback time">
                <select className="field-input" {...register('preferredTime')}>
                  <option>Weekday mornings</option>
                  <option>Weekday afternoons</option>
                  <option>Weekday evenings</option>
                  <option>Weekends</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="card stack">
            <h2 className="m-0">Payment preference</h2>
            <p className="m-0 text-sm text-muted">
              Instalments are our primary way to book.{' '}
              <Link href={INSTALMENTS_HREF} className="font-semibold text-accent hover:underline">
                How it works →
              </Link>
            </p>
            {(
              [
                {
                  key: 'installments' as const,
                  title: instalmentCopy.checkoutPrimary,
                  body: instalmentCopy.checkoutPrimaryBody,
                  primary: true,
                },
                {
                  key: 'full' as const,
                  title: instalmentCopy.checkoutFull,
                  body: instalmentCopy.checkoutFullBody,
                  primary: false,
                },
              ] as const
            ).map((opt) => (
              <label
                key={opt.key}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  opt.primary ? 'instalment-option-primary' : ''
                } ${
                  pref === opt.key
                    ? opt.primary
                      ? 'border-accent'
                      : 'border-brand bg-chip'
                    : 'border-line hover:border-brand/50'
                }`}
              >
                {opt.primary ? (
                  <span className="instalment-option-badge">Most popular</span>
                ) : null}
                <input
                  type="radio"
                  value={opt.key}
                  className="mt-1 accent-[var(--color-accent)]"
                  {...register('paymentPreference')}
                />
                <span>
                  <span className="block font-semibold text-ink">{opt.title}</span>
                  <span className="block text-sm text-muted">{opt.body}</span>
                </span>
              </label>
            ))}
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 accent-brand" {...register('consent')} />
            <span>
              I agree to be contacted by phone, email, or WhatsApp about this flight request.
            </span>
          </label>

          {serverError ? <p className="text-red-700">{serverError}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-accent py-3.5 text-base font-bold text-white transition hover:bg-accent-dark disabled:opacity-60 sm:w-auto sm:self-start sm:px-10"
          >
            {isSubmitting ? 'Submitting…' : 'Request a callback'}
          </button>
        </form>

        <aside
          className="card stack lg:sticky"
          style={{ top: 'calc(var(--site-chrome-height, 6.5rem) + 0.75rem)' }}
        >
          <div className="rounded-xl border border-accent/25 bg-[#fff7f2] px-3 py-2.5">
            <p className="m-0 text-sm font-bold text-brand-navy">{instalmentCopy.motto}</p>
            <p className="mt-0.5 text-xs text-muted">Selected by default below</p>
          </div>
          <h2 className="m-0">Your selection</h2>
          {seg ? (
            <div className="text-sm">
              <div className="font-semibold text-brand-navy">
                {seg.origin} → {offer.slices[0]?.segments.at(-1)?.destination}
              </div>
              <div className="text-muted">
                {seg.carrier} · {new Date(seg.departAt).toLocaleDateString('en-GB')}
              </div>
              <div className="mt-1 text-muted">
                {travellers.adults} adult{travellers.adults > 1 ? 's' : ''}
                {travellers.children ? ` · ${travellers.children} child(ren)` : ''}
                {travellers.infants ? ` · ${travellers.infants} infant(s)` : ''} ·{' '}
                {travellers.cabin.replace('_', ' ')}
              </div>
              {offer.fareBrand ? <div className="mt-1 chip">{offer.fareBrand}</div> : null}
            </div>
          ) : null}
          <div className="border-t border-line pt-3">
            <div className="flex items-center justify-between">
              <span className="text-muted">Displayed fare</span>
              <span className="price">{formatMoney(offer.price.total)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Indicative only — confirmed on the call before any payment.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}
