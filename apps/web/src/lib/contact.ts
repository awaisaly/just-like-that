import { z } from 'zod';

/** UK call-centre defaults (Noble Travel). Override via NEXT_PUBLIC_* env vars. */
export const DEFAULT_SUPPORT_PHONE = '+442079935216';
export const DEFAULT_SUPPORT_EMAIL = 'Info@nobletravel.co.uk';
/** Google Ads website call-conversion number (national or E.164). */
export const DEFAULT_ADS_TRACKING_PHONE = '02080901460';

/**
 * WhatsApp chat lines (E.164 digits, no +). Edit here — not via env.
 * First entry is primary.
 */
export const WHATSAPP_NUMBERS = ['442079935216', '442080901460'] as const;

export function getSupportPhone(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || DEFAULT_SUPPORT_PHONE;
}

export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
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

/** Ads tracking line when it differs from the main support number (avoid duplicate links). */
export function getAdsTrackingPhoneIfDistinct(
  supportPhone = getSupportPhone(),
): string | null {
  const ads = getAdsTrackingPhone();
  if (!ads) return null;
  if (supportPhoneDigits(ads) === supportPhoneDigits(supportPhone)) return null;
  return ads;
}

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
    display: formatSupportPhone(`+${value}`),
    label: unique.length > 1 ? `WhatsApp ${index + 1}` : 'WhatsApp',
  }));
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
