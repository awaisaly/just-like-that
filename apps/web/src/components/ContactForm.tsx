'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiFetch } from '../lib/api';
import { AGENCY_NAME } from '../lib/brand';
import { FieldError } from './FieldError';

type FormValues = {
  name: string;
  email: string;
  phone: string;
  topic: 'booking' | 'instalments' | 'general' | 'partnership';
  message: string;
  consent: boolean;
  company: string;
};

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const consentId = useId();
  const serverId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      topic: 'general',
      message: '',
      consent: false,
      company: '',
    },
  });

  async function onSubmit(values: FormValues) {
    if (!values.consent) {
      setServerError('Please confirm we can contact you about this enquiry');
      return;
    }

    setServerError(null);
    try {
      const data = await apiFetch<{ reference: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          topic: values.topic,
          message: values.message,
          consent: true,
          company: values.company,
        }),
      });
      setReference(data.reference);
      reset({
        name: '',
        email: '',
        phone: '',
        topic: 'general',
        message: '',
        consent: false,
        company: '',
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not send your message');
    }
  }

  if (reference) {
    return (
      <div className="rounded-2xl border border-line bg-chip px-5 py-8 text-center sm:px-8" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Message sent</p>
        <h2 className="mt-2 text-2xl font-extrabold text-brand-navy">Thanks — we’ll be in touch</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Your enquiry reference is <strong className="text-ink">{reference}</strong>. A UK team member
          will reply by email or phone shortly.
        </p>
        <button
          type="button"
          onClick={() => setReference(null)}
          className="mt-6 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="stack" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block" htmlFor={nameId}>
          <span className="field-label">Full name</span>
          <input
            id={nameId}
            className={`field-input ${errors.name ? 'control-error' : ''}`}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            {...register('name', { required: 'Enter your name' })}
          />
          <FieldError id={`${nameId}-error`} message={errors.name?.message} />
        </label>
        <label className="block" htmlFor={emailId}>
          <span className="field-label">Email</span>
          <input
            id={emailId}
            type="email"
            className={`field-input ${errors.email ? 'control-error' : ''}`}
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            {...register('email', {
              required: 'Enter your email',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
          />
          <FieldError id={`${emailId}-error`} message={errors.email?.message} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Phone (optional)</span>
          <input type="tel" className="field-input" autoComplete="tel" {...register('phone')} />
        </label>
        <label className="block">
          <span className="field-label">Topic</span>
          <select className="field-input" {...register('topic')}>
            <option value="general">General enquiry</option>
            <option value="booking">Booking help</option>
            <option value="instalments">Instalments</option>
            <option value="partnership">Partnership</option>
          </select>
        </label>
      </div>

      <label className="block" htmlFor={messageId}>
        <span className="field-label">Message</span>
        <textarea
          id={messageId}
          rows={5}
          className={`field-input resize-y ${errors.message ? 'control-error' : ''}`}
          placeholder="Tell us how we can help…"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
          {...register('message', {
            required: 'Write a short message',
            minLength: { value: 10, message: 'Please add a little more detail' },
          })}
        />
        <FieldError id={`${messageId}-error`} message={errors.message?.message} />
      </label>

      <label className="flex items-start gap-3 text-sm text-muted" htmlFor={consentId}>
        <input
          id={consentId}
          type="checkbox"
          className="mt-1"
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? `${consentId}-error` : undefined}
          {...register('consent', {
            required: 'Please confirm we can contact you about this enquiry',
          })}
        />
        <span>I agree that {AGENCY_NAME} can contact me about this enquiry.</span>
      </label>
      <FieldError id={`${consentId}-error`} message={errors.consent?.message} />

      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
        {...register('company')}
      />

      {serverError ? (
        <p
          id={serverId}
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
