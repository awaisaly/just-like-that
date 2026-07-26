import { Resend } from 'resend';
import type { ContactEnquiryInput } from '../lib/contact';

const topicLabels: Record<ContactEnquiryInput['topic'], string> = {
  booking: 'Booking help',
  instalments: 'Instalments',
  general: 'General enquiry',
  partnership: 'Partnership',
};

export async function sendContactEmail(
  enquiry: ContactEnquiryInput,
  reference: string,
): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.LEADS_EMAIL_TO;
  const sender = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !recipient || !sender) {
    if (process.env.VERCEL_ENV === 'production') {
      throw new Error('Contact email delivery is not configured');
    }
    console.info(`Contact enquiry ${reference} accepted without sending email (Resend not configured)`);
    return `local-${reference}`;
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: sender,
    to: recipient
      .split(',')
      .map((address) => address.trim())
      .filter(Boolean),
    replyTo: enquiry.email,
    subject: `Contact ${reference}: ${topicLabels[enquiry.topic]} — ${enquiry.name}`,
    text: [
      `Contact enquiry: ${reference}`,
      '',
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Phone: ${enquiry.phone || '—'}`,
      `Topic: ${topicLabels[enquiry.topic]}`,
      '',
      enquiry.message,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;color:#16202c">
        <h1 style="color:#10193a">Contact enquiry ${escapeHtml(reference)}</h1>
        <table style="border-collapse:collapse;width:100%">
          ${row('Name', enquiry.name)}
          ${row('Email', enquiry.email)}
          ${row('Phone', enquiry.phone || '—')}
          ${row('Topic', topicLabels[enquiry.topic])}
        </table>
        <p style="margin-top:20px;white-space:pre-wrap">${escapeHtml(enquiry.message)}</p>
      </div>
    `,
  });

  if (result.error || !result.data?.id) {
    throw new Error(result.error?.message ?? 'Resend did not accept the contact email');
  }

  return result.data.id;
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
