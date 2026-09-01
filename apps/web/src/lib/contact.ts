import { z } from 'zod';

/** WhatsApp line (1460). Not used for `tel:` links. */
export const DEFAULT_SUPPORT_PHONE = '+442080901460';
export const DEFAULT_SUPPORT_EMAIL = 'Info@nobletravel.co.uk';
/** Google Ads website call-conversion number (national or E.164). */
export const DEFAULT_ADS_TRACKING_PHONE = '02080901460';

/**
 * Voice line — shown only on `/contact`. Do not use in header, footer, or CTAs.
 */
export const CONTACT_CALL_PHONE = '+442079935216';

/**
 * WhatsApp chat lines (E.164 digits, no +). Edit here — not via env.
 * 1460 is WhatsApp only — site “call” buttons open WhatsApp, not tel:.
 */
export const WHATSAPP_NUMBERS = ['442080901460'] as const;

export function getSupportPhone(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || DEFAULT_SUPPORT_PHONE;
}

export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
}

/** UK voice number for the contact page only. */
export function getContactCallPhone(): string {
  return CONTACT_CALL_PHONE;
}

export function getContactCallDisplay(): string {
  return formatSupportPhone(CONTACT_CALL_PHONE);
}

/**
 * Normalise a UK/E.164 phone string to `+` E.164 (or return trimmed input).
 * Accepts `02080901460`, `+442080901460`, `442080901460`.
 */
export function toE164Phone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/[^\d]/g, '');
    return digits ? `+${digits}` : trimmed;
  }
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.startsWith('0') && digits.length === 11) return `+44${digits.slice(1)}`;
  if (digits.startsWith('44') && digits.length >= 12) return `+${digits}`;
  return digits ? `+${digits}` : trimmed;
}

/**
 * Phone number used for Google Ads website call conversions.
 * Prefer NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_NUMBER (same value as gtag).
 */
export function getAdsTrackingPhone(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_ADS_TRACKING_PHONE?.trim() ||
    DEFAULT_ADS_TRACKING_PHONE;
  if (!raw) return null;
  return toE164Phone(raw);
}

/** True when the public support line is the Google Ads website-call number. */
export function isAdsTrackedPhone(phone = getSupportPhone()): boolean {
  const ads = getAdsTrackingPhone();
  return Boolean(ads && supportPhoneDigits(ads) === supportPhoneDigits(phone));
}

/** Visible Call number — unspaced Ads format when that is the support line. */
export function getPublicPhoneDisplay(phone = getSupportPhone()): string {
  if (isAdsTrackedPhone(phone)) return getAdsTrackingPhoneDisplay();
  return formatSupportPhone(phone);
}

/** Class Google’s website-call snippet uses to rewrite display + tel: href. */
export const ADS_CALL_LINK_CLASS = 'js-ads-call';
export const ADS_CALL_NUMBER_CLASS = 'js-ads-call-number';

/**
 * Visible Ads number must match `phone_conversion_number` in gtag exactly
 * (Google’s website-call snippet will not swap a spaced/formatted number).
 */
export function getAdsTrackingPhoneDisplay(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_NUMBER?.trim() ||
    DEFAULT_ADS_TRACKING_PHONE
  );
}

/** Digits for tel: / wa.me (E.164 without +). */
export function supportPhoneDigits(phone = getSupportPhone()): string {
  return phone.replace(/[^\d]/g, '');
}

/** Human-readable UK display, e.g. 0208 090 1460 */
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

/** `tel:` href — pass the contact-page voice number; never the WhatsApp line. */
export function supportTelHref(phone: string): string {
  const digits = supportPhoneDigits(toE164Phone(phone));
  return digits ? `tel:+${digits}` : `tel:${phone}`;
}

export function supportMailtoHref(email = getSupportEmail()): string {
  return `mailto:${email}`;
}

export type WhatsAppLine = {
  digits: string;
  display: string;
  label: string;
};

/** All WhatsApp chat lines from WHATSAPP_NUMBERS (primary first). */
export function getWhatsAppLines(): WhatsAppLine[] {
  const unique = [...new Set(WHATSAPP_NUMBERS.map((value) => value.replace(/[^\d]/g, '')))].filter(
    (digits) => digits.length >= 10,
  );

  return unique.map((value, index) => ({
    digits: value,
    display: getPublicPhoneDisplay(`+${value}`),
    label: unique.length > 1 ? `WhatsApp ${index + 1}` : 'WhatsApp',
  }));
}

/** Primary WhatsApp line, or null if none are configured. */
export function getPrimaryWhatsAppLine(): WhatsAppLine | null {
  return getWhatsAppLines()[0] ?? null;
}

export function whatsappChatHref(
  digits: string,
  message = 'Hi, I have a question about flights on Elca Airbridge.',
): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Primary WhatsApp chat URL (wa.me). */
export function getWhatsAppChatUrl(
  message = 'Hi, I have a question about flights on Elca Airbridge.',
): string | null {
  const [primary] = getWhatsAppLines();
  if (!primary) return null;
  return whatsappChatHref(primary.digits, message);
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
