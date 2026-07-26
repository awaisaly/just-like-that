import type { Metadata } from 'next';
import { AGENCY_NAME } from './brand';

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

/** Primary keyword clusters for Elca Airbridge (UK ↔ Africa / Nigeria). */
export const SITE_KEYWORDS = [
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
  'pay for flights in instalments',
  AGENCY_NAME,
] as const;

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
          url: `/og?title=${encodeURIComponent(socialTitle)}`,
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
      images: [`/og?title=${encodeURIComponent(socialTitle)}`],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
