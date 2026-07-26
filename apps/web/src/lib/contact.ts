import { z } from 'zod';

/** UK call-centre defaults (Noble Travel). Override via NEXT_PUBLIC_* env vars. */
export const DEFAULT_SUPPORT_PHONE = '+442079935216';
export const DEFAULT_SUPPORT_EMAIL = 'Info@nobletravel.co.uk';

export function getSupportPhone(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || DEFAULT_SUPPORT_PHONE;
}

export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
}

/** Digits for tel: / wa.me (E.164 without +). */
export function supportPhoneDigits(phone = getSupportPhone()): string {
  return phone.replace(/[^\d]/g, '');
}

/** Human-readable UK display, e.g. 0207 993 5216 */
export function formatSupportPhone(phone = getSupportPhone()): string {
  const digits = supportPhoneDigits(phone);
  if (digits.startsWith('44') && digits.length === 12) {
    const national = `0${digits.slice(2)}`;
    return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function supportTelHref(phone = getSupportPhone()): string {
  const digits = supportPhoneDigits(phone);
  return digits ? `tel:+${digits}` : `tel:${phone}`;
}

export function supportMailtoHref(email = getSupportEmail()): string {
  return `mailto:${email}`;
}

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  topic: z.enum(['booking', 'instalments', 'general', 'partnership']),
  message: z.string().trim().min(10).max(4000),
  consent: z.literal(true),
  company: z.string().max(120).optional(),
});

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;
