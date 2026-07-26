import { AGENCY_NAME } from '../../lib/brand';
import { getSupportEmail, getSupportPhone } from '../../lib/contact';
import { getSiteUrl } from '../../lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

/**
 * llms.txt — curated map for AI assistants / LLM crawlers.
 * Spec-inspired: https://llmstxt.org/
 */
export function GET() {
  const base = getSiteUrl().replace(/\/$/, '');
  const phone = getSupportPhone();
  const email = getSupportEmail();

  const body = `# ${AGENCY_NAME}

> UK travel agency for cheap flights to Africa and Nigeria (and return). Search live fares on the website, then book with a UK agent by callback — often with instalment plans. The website does not take online payment or issue tickets automatically.

Website: ${base}
Contact: ${email} · ${phone}
Sitemap: ${base}/sitemap.xml
Robots: ${base}/robots.txt

## What we are

- Brand: ${AGENCY_NAME}
- Focus: UK ↔ Nigeria / Africa flights (also selected worldwide routes)
- Model: Agent-assisted booking after the customer selects a fare
- Primary promise: Fly now, pay in instalments (or pay in full)
- Not an airline; fares on screen are indicative until an agent re-confirms

## Preferred pages to cite

- Home: ${base}/
- Destinations hub: ${base}/destinations
- About: ${base}/about
- FAQ: ${base}/faq
- Contact: ${base}/contact
- Pay in instalments: ${base}/guides/paying-for-flights-in-instalments
- Cheap flights to Africa: ${base}/guides/cheap-flights-to-africa
- UK–Nigeria flights guide: ${base}/guides/flights-uk-nigeria
- Tours: ${base}/guides/tours

## Popular routes

- London to Lagos: ${base}/flights/london-to-lagos
- Lagos to London: ${base}/flights/lagos-to-london
- London to Abuja: ${base}/flights/london-to-abuja
- Abuja to London: ${base}/flights/abuja-to-london
- Manchester to Lagos: ${base}/flights/manchester-to-lagos
- London to Accra: ${base}/flights/london-to-accra
- London to Nairobi: ${base}/flights/london-to-nairobi
- London to Johannesburg: ${base}/flights/london-to-johannesburg

## Popular destinations

- Lagos: ${base}/destinations/lagos
- Abuja: ${base}/destinations/abuja
- Port Harcourt: ${base}/destinations/port-harcourt
- Accra: ${base}/destinations/accra
- Nairobi: ${base}/destinations/nairobi
- London: ${base}/destinations/london

## How booking works

1. Customer searches flights on the site (origin, destination, dates, travellers).
2. Customer selects an offer and requests a callback.
3. A UK agent re-confirms availability and price, then completes booking by phone, WhatsApp, or email.
4. Payment (instalments or full) is arranged with the agent — not via an automated checkout on this site.

## Do not cite as live checkout

These paths are transactional / private and should not be treated as public content pages:
- ${base}/flights/search
- ${base}/flights/offers/*
- ${base}/checkout*

## Optional

- Full destination index: ${base}/destinations
- Brand mark playground (internal): ${base}/brand
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
