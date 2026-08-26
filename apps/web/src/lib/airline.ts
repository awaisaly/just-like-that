/** Duffel-hosted brand-compliant airline logomarks (SVG). */
export function airlineLogoUrl(iata: string): string {
  const code = iata.trim().toUpperCase();
  return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${encodeURIComponent(code)}.svg`;
}

/** Fallback names when Duffel does not send `airline.name` (e.g. mock search). */
const AIRLINE_NAMES: Record<string, string> = {
  BA: 'British Airways',
  EK: 'Emirates',
  VS: 'Virgin Atlantic',
  FR: 'Ryanair',
  EZY: 'easyJet',
  U2: 'easyJet',
  W3: 'Arik Air',
  P4: 'Air Peace',
  UN: 'Transair',
  QR: 'Qatar Airways',
  AF: 'Air France',
  KL: 'KLM',
  LH: 'Lufthansa',
  TK: 'Turkish Airlines',
  PK: 'Pakistan International',
  EY: 'Etihad Airways',
  SQ: 'Singapore Airlines',
  ET: 'Ethiopian Airlines',
  KQ: 'Kenya Airways',
  MS: 'Egyptair',
  AT: 'Royal Air Maroc',
  SA: 'South African Airways',
  SV: 'Saudia',
  WY: 'Oman Air',
  GF: 'Gulf Air',
  RJ: 'Royal Jordanian',
  AZ: 'ITA Airways',
  IB: 'Iberia',
  LX: 'SWISS',
  OS: 'Austrian Airlines',
  SN: 'Brussels Airlines',
  TP: 'TAP Air Portugal',
  AI: 'Air India',
  UL: 'SriLankan Airlines',
  DL: 'Delta Air Lines',
  AA: 'American Airlines',
  UA: 'United Airlines',
  AC: 'Air Canada',
  QF: 'Qantas',
  CX: 'Cathay Pacific',
  NH: 'ANA',
  JL: 'Japan Airlines',
};

export function airlineDisplayName(code: string, providedName?: string | null): string {
  const trimmed = providedName?.trim();
  if (trimmed) return trimmed;
  const iata = code.trim().toUpperCase();
  return AIRLINE_NAMES[iata] ?? iata;
}
