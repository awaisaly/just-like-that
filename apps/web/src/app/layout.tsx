import type { Metadata, Viewport } from 'next';
import { Syne } from 'next/font/google';
import Script from 'next/script';
import { AdsWhatsAppTracker } from '../components/AdsWhatsAppTracker';
import { DeferredWhatsAppChatButton } from '../components/DeferredWhatsAppChatButton';
import { Providers } from '../components/Providers';
import { SiteChrome } from '../components/SiteChrome';
import { SiteFooter } from '../components/SiteFooter';
import { AGENCY_NAME } from '../lib/brand';
import { ADS_CALL_LINK_CLASS, ADS_CALL_NUMBER_CLASS, getSupportEmail } from '../lib/contact';
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

const defaultTitle = `${AGENCY_NAME} — Cheap Flights from London to Lagos & Nigeria`;
const defaultDescription = `Cheap flights from London to Lagos and flights to Nigeria from London. Tickets from Lagos to London and flights from Nigeria to London — book with ${AGENCY_NAME}, a UK agent. Pay in instalments or in full.`;

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
        url: `/og?title=${encodeURIComponent('Cheap flights from London to Lagos')}`,
        width: 1200,
        height: 630,
        alt: `${AGENCY_NAME} — cheap flights from London to Lagos and Nigeria`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [`/og?title=${encodeURIComponent('Cheap flights from London to Lagos')}`],
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
  const supportEmail = getSupportEmail();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();
  const googleAdsPhoneConversionId =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_ID?.trim();
  const googleAdsPhoneConversionNumber =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION_NUMBER?.trim();
  const gtagIds = [gaId, googleAdsId].filter(Boolean) as string[];
  const gtagPrimaryId = gtagIds[0] ?? googleAdsPhoneConversionId?.split('/')[0];
  const gtagPhoneConversion =
    googleAdsPhoneConversionId && googleAdsPhoneConversionNumber
      ? `gtag('config',${JSON.stringify(googleAdsPhoneConversionId)},{phone_conversion_number:${JSON.stringify(googleAdsPhoneConversionNumber)},phone_conversion_css_class:${JSON.stringify(ADS_CALL_LINK_CLASS)},phone_conversion_callback:function(formatted_number,mobile_number){document.querySelectorAll('a.${ADS_CALL_LINK_CLASS}').forEach(function(link){link.setAttribute('href','tel:'+mobile_number);link.querySelectorAll('.${ADS_CALL_NUMBER_CLASS}').forEach(function(node){node.textContent=formatted_number;});});}});`
      : '';

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
      'cheap flights from London to Lagos',
      'flights to Nigeria from London',
      'flight ticket to Nigeria from London',
      'tickets from Lagos to London',
      'cheap ticket from Lagos to London',
      'flight from Nigeria to London',
      'cheap flights to Africa',
      'flights from UK to Nigeria',
      'flight instalment plans',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: supportEmail,
      url: `${siteUrl}/contact`,
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
      `${siteUrl}/flights/london-to-lagos`,
      `${siteUrl}/flights/lagos-to-london`,
      `${siteUrl}/destinations`,
      `${siteUrl}/destinations/lagos`,
      `${siteUrl}/destinations/london`,
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
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
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
        <AdsWhatsAppTracker />
        <DeferredWhatsAppChatButton />
        {gtmId ? (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
        {/* Direct gtag (GA4 and/or Google Ads). Prefer GA4 via GTM when possible to avoid double counting. */}
        {gtagPrimaryId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gtagPrimaryId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gtagIds
                .map((id) => `gtag('config',${JSON.stringify(id)});`)
                .join('')}${gtagPhoneConversion}`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
