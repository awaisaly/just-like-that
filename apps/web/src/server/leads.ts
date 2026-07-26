import { Resend } from 'resend';
import { formatMoney } from '@jlt/shared';
import type { CallbackLeadInput } from '../lib/lead';

export async function sendCallbackEmail(
  lead: CallbackLeadInput,
  reference: string,
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.LEADS_EMAIL_TO;
  const sender = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !recipient || !sender) {
    // Fail only on a real Vercel production deploy — local `next start` and preview
    // builds can accept leads without Resend so the callback flow stays testable.
    if (process.env.VERCEL_ENV === 'production') {
      throw new Error('Callback email delivery is not configured');
    }
    console.info(`Callback request ${reference} accepted without sending email (Resend not configured)`);
    return `local-${reference}`;
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: sender,
    to: recipient
      .split(',')
      .map((address) => address.trim())
      .filter(Boolean),
    replyTo: lead.contact.email,
    subject: `Callback request ${reference}: ${routeLabel(lead)}`,
    text: createTextEmail(lead, reference),
    html: createHtmlEmail(lead, reference),
  });

  if (result.error || !result.data?.id) {
    throw new Error(result.error?.message ?? 'Resend did not accept the callback email');
  }

  return result.data.id;
}

function createTextEmail(lead: CallbackLeadInput, reference: string): string {
  const first = lead.offer.slices[0]?.segments[0];
  const lastSlice = lead.offer.slices[lead.offer.slices.length - 1];
  const last = lastSlice?.segments[lastSlice.segments.length - 1];

  return [
    `Callback request: ${reference}`,
    '',
    `Customer: ${lead.contact.firstName} ${lead.contact.lastName}`,
    `Email: ${lead.contact.email}`,
    `Phone: ${lead.contact.phone}`,
    `Preferred time: ${lead.preferredTime}`,
    `Payment preference: ${lead.paymentPreference}`,
    '',
    `Route: ${first?.origin ?? '—'} to ${last?.destination ?? '—'}`,
    `Travellers: ${lead.travellers.adults} adult(s), ${lead.travellers.children} child(ren), ${lead.travellers.infants} infant(s)`,
    `Cabin: ${lead.travellers.cabin}`,
    `Displayed fare: ${formatMoney(lead.offer.price.total)}`,
    `Provider offer: ${lead.offer.providerOfferId}`,
    `Offer expires: ${lead.offer.expiresAt}`,
    '',
    'The displayed fare is indicative. Re-price and confirm availability before taking payment.',
  ].join('\n');
}

function createHtmlEmail(lead: CallbackLeadInput, reference: string): string {
  const itinerary = lead.offer.slices
    .map(
      (slice, sliceIndex) => `
        <h3 style="margin:20px 0 8px">${sliceIndex === 0 ? 'Outbound' : 'Return'}</h3>
        ${slice.segments
          .map(
            (segment) => `
              <p style="margin:6px 0">
                <strong>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</strong>
                · ${escapeHtml(segment.carrier)} ${escapeHtml(segment.flightNumber)}
                · ${escapeHtml(new Date(segment.departAt).toLocaleString('en-GB'))}
              </p>`,
          )
          .join('')}
      `,
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;color:#16202c">
      <h1 style="color:#10193a">Callback request ${escapeHtml(reference)}</h1>
      <p>A customer has selected a flight and requested a representative callback.</p>
      <table style="border-collapse:collapse;width:100%">
        ${row('Customer', `${lead.contact.firstName} ${lead.contact.lastName}`)}
        ${row('Email', lead.contact.email)}
        ${row('Phone', lead.contact.phone)}
        ${row('Preferred time', lead.preferredTime)}
        ${row('Payment preference', lead.paymentPreference)}
        ${row(
          'Travellers',
          `${lead.travellers.adults} adult(s), ${lead.travellers.children} child(ren), ${lead.travellers.infants} infant(s)`,
        )}
        ${row('Cabin', lead.travellers.cabin)}
        ${row('Displayed fare', formatMoney(lead.offer.price.total))}
        ${row('Provider offer', lead.offer.providerOfferId)}
      </table>
      ${itinerary}
      <p style="margin-top:24px;padding:12px;background:#f4f6f9">
        Re-price and confirm availability before taking payment. No booking or payment has been
        created by the website.
      </p>
    </div>
  `;
}

function routeLabel(lead: CallbackLeadInput): string {
  const first = lead.offer.slices[0]?.segments[0];
  const finalSlice = lead.offer.slices[lead.offer.slices.length - 1];
  const last = finalSlice?.segments[finalSlice.segments.length - 1];
  return `${first?.origin ?? 'Flight'} to ${last?.destination ?? 'request'}`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="border-bottom:1px solid #e5e8ec;padding:8px 12px 8px 0;color:#64748b">${escapeHtml(label)}</td>
    <td style="border-bottom:1px solid #e5e8ec;padding:8px 0;font-weight:600">${escapeHtml(value)}</td>
  </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
