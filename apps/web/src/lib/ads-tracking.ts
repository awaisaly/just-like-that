export function getWhatsAppConversionId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_CONVERSION_ID?.trim() || '';
}

export function isWhatsAppHref(href: string | null | undefined): boolean {
  if (!href) return false;
  const value = href.toLowerCase();
  return (
    value.includes('wa.me/') ||
    value.includes('api.whatsapp.com/') ||
    value.includes('whatsapp.com/send')
  );
}
