import type { Metadata, Viewport } from 'next';
import { Syne } from 'next/font/google';
import Script from 'next/script';
import { DeferredWhatsAppChatButton } from '../components/DeferredWhatsAppChatButton';
import { Providers } from '../components/Providers';
import { SiteChrome } from '../components/SiteChrome';
import { SiteFooter } from '../components/SiteFooter';
import { AGENCY_NAME } from '../lib/brand';
import { getSupportEmail, getSupportPhone } from '../lib/contact';
import { getSiteUrl, SITE_KEYWORDS } from '../lib/seo';
import './globals.css';

const brandFont = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-brand',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

const defaultTitle = `${AGENCY_NAME} — Cheap Flights to Africa & Nigeria | Pay in Instalments`;
const defaultDescription = `Search cheap flights to Africa and Nigeria from the UK — and Nigeria to the UK. London–Lagos, Abuja, Accra and more. Book with ${AGENCY_NAME}, a UK agent. Pay in instalments before you fly — or in full.`;

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: `%s | ${AGENCY_NAME}`,
  },
  description: defaultDescription,
  keywords: [...SITE_KEYWORDS],
  metadataBase: new URL(getSiteUrl()),
  applicationName: AGENCY_NAME,
  authors: [{ name: AGENCY_NAME }],
  creator: AGENCY_NAME,
  publisher: AGENCY_NAME,
  category: 'travel',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: AGENCY_NAME,
    title: defaultTitle,
    description: defaultDescription,
    url: '/',
    images: [
      {
        url: `/og?title=${encodeURIComponent('Cheap flights to Africa & Nigeria')}`,
        width: 1200,
        height: 630,
        alt: `${AGENCY_NAME} — cheap flights to Africa and Nigeria`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [`/og?title=${encodeURIComponent('Cheap flights to Africa & Nigeria')}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supportPhone = getSupportPhone();
  const supportEmail = getSupportEmail();

  const siteUrl = getSiteUrl();

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'TravelAgency'],
    name: AGENCY_NAME,
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    image: `${siteUrl}/icon-512.png`,
    email: supportEmail,
    description: defaultDescription,
    areaServed: [
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Nigeria' },
      { '@type': 'Continent', name: 'Africa' },
    ],
    knowsAbout: [
      'cheap flights to Africa',
      'flights from UK to Nigeria',
      'flights from Nigeria to UK',
      'London to Lagos flights',
      'flight instalment plans',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: supportPhone,
      email: supportEmail,
      contactType: 'customer service',
      areaServed: ['GB', 'NG'],
      availableLanguage: ['English'],
    },
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: AGENCY_NAME,
    url: siteUrl,
    description: defaultDescription,
    inLanguage: 'en-GB',
    // Point assistants at indexable hubs — not /flights/search (noindex / robots disallow).
    significantLink: [
      `${siteUrl}/destinations`,
      `${siteUrl}/guides/cheap-flights-to-africa`,
      `${siteUrl}/guides/flights-uk-nigeria`,
      `${siteUrl}/guides/paying-for-flights-in-instalments`,
      `${siteUrl}/faq`,
      `${siteUrl}/contact`,
      `${siteUrl}/llms.txt`,
    ],
  };

  return (
    <html lang="en-GB" className={brandFont.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SiteChrome />
        <Providers>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </Providers>
        <SiteFooter />
        <DeferredWhatsAppChatButton />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
