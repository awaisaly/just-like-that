export function getGoogleAdsId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || '';
}

/** `AW-…/label` from a Google Ads **click** conversion — not page view or calls-from-ads. */
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

export function whatsappCtaSource(anchor: HTMLAnchorElement): string {
  const marked = anchor.getAttribute('data-whatsapp-cta')?.trim();
  if (marked) return marked;
  const className = anchor.className;
  if (className.includes('offer-whatsapp')) return 'booking';
  if (className.includes('whatsapp-fab')) return 'float';
  if (className.includes('nav-call') || className.includes('nav-drawer-call')) return 'header';
  if (className.includes('footer-contact')) return 'footer';
  return 'link';
}
