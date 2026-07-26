/** Duffel-hosted brand-compliant airline logomarks (SVG). */
export function airlineLogoUrl(iata: string): string {
  const code = iata.trim().toUpperCase();
  return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${encodeURIComponent(code)}.svg`;
}
