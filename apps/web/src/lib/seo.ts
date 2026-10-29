import type { Metadata } from 'next';
import { AGENCY_NAME } from './brand';

/** Public production origin. Replaces a stale or local site URL on production builds. */
const PRODUCTION_SITE_URL = 'https://www.elcaairbridge.com';

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') ?? '';
  const stale =
    !configured || /localhost|127\.0\.0\.1|cheapnigeriaflights\.org/i.test(configured);
  const production =
    process.env.NEXT_PUBLIC_APP_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  if (stale && production) return PRODUCTION_SITE_URL;
  return configured || 'http://localhost:3000';
}

/**
 * High-intent queries from Google Search / Ads reports.
 * Used in metadata and on-page copy for London ↔ Lagos / Nigeria.
 */
export const CAMPAIGN_SEARCH_TERMS = [
  'tickets from lagos to london',
  'flight ticket to nigeria from london',
  'flight from nigeria to london',
  'cheap flights from london to lagos',
  'flights to nigeria from london',
  'cheap ticket from lagos to london',
] as const;

/** Primary keyword clusters for Elca Airbridge (UK ↔ Africa / Nigeria). */
export const SITE_KEYWORDS = [
  ...CAMPAIGN_SEARCH_TERMS,
  'cheap flights to Africa',
  'cheap flights to Nigeria',
  'flights from UK to Nigeria',
  'flights from Nigeria to UK',
  'London to Lagos flights',
  'Lagos to London flights',
  'London to Abuja flights',
  'cheap flights London to Lagos',
  'flights to Accra from UK',
  'UK to Africa flights',
  'Nigeria to UK flights',
  AGENCY_NAME,
] as const;

/** Extra keywords for a specific landing (campaign terms plus page phrases). */
export function landingKeywords(...extra: string[]): string[] {
  return [...new Set([...CAMPAIGN_SEARCH_TERMS, ...extra, AGENCY_NAME])];
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogTitle?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [...SITE_KEYWORDS],
  ogTitle,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = path ? `${siteUrl}${path.startsWith('/') ? path : `/${path}`}` : siteUrl;
  const socialTitle = ogTitle ?? title;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: path ? { canonical: path.startsWith('/') ? path : `/${path}` } : undefined,
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      siteName: AGENCY_NAME,
      title: socialTitle,
      description,
      url,
      images: [
        {
          url: `/og?title=${encodeURIComponent(socialTitle)}&v=2`,
          type: 'image/png',
          width: 1200,
          height: 630,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [`/og?title=${encodeURIComponent(socialTitle)}&v=2`],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
