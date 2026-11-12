/** Customer-facing agency name. Repo / package name stays `just-like-that`. */
export const AGENCY_NAME = 'Elca Airbridge';

/** Companies House name, including the registered spelling. */
export const LEGAL_COMPANY_NAME = 'ELCA SERVCIES LTD';

export const COMPANY_NUMBER = '10892708';

/** Current registered office on the Companies House record. */
export const REGISTERED_OFFICE = '43 South Mead, Redhill, England, RH1 2EL';

/** Possessive form for copy (“Elca Airbridge’s …”). */
export const AGENCY_NAME_POSSESSIVE = `${AGENCY_NAME}’s`;

/** Nav wordmark styles — switch after comparing at `/brand`. */
export const NAV_WORDMARK_VARIANTS = [
  'stack',
  'inline',
  'bridge',
  'solid',
  'split',
  'caps',
] as const;

export type NavWordmarkVariant = (typeof NAV_WORDMARK_VARIANTS)[number];

/** Active nav mark. Change this (or use `?mark=` on any page) to try variants. */
export const NAV_WORDMARK_VARIANT: NavWordmarkVariant = 'stack';

export const NAV_WORDMARK_LABELS: Record<NavWordmarkVariant, string> = {
  stack: 'Stacked — ELCA over Airbridge + underline',
  inline: 'Inline — Elca · Airbridge',
  bridge: 'Bridge — Elca ⟶ Airbridge with arc',
  solid: 'Solid — single navy lockup',
  split: 'Split — soft Elca + bold Airbridge',
  caps: 'Caps — ELCA AIRBRIDGE tracked',
};
