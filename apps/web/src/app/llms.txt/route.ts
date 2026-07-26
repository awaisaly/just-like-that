import { AGENCY_NAME } from '../../lib/brand';
import { getSupportEmail, getSupportPhone } from '../../lib/contact';
import { getSiteUrl } from '../../lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

/**
 * llms.txt — curated map for AI assistants / LLM crawlers.
 * Spec: https://llmstxt.org/
 *
 * Lighthouse requires: H1, ≥50 chars, and at least one Markdown link `[text](url)`.
 */
export function GET() {
  const base = getSiteUrl().replace(/\/$/, '');
  const phone = getSupportPhone();
  const email = getSupportEmail();

  const body = `# ${AGENCY_NAME}

> UK travel agency for cheap flights to Africa and Nigeria (and return). Search live fares on the website, then book with a UK agent — often with instalment plans paid before you fly. The website does not take online payment or issue tickets automatically.

- Brand: ${AGENCY_NAME}
- Focus: UK ↔ Nigeria / Africa flights (also selected worldwide routes)
- Model: Agent-assisted booking after the customer selects a fare
- Fares on screen are indicative until an agent re-confirms
- Contact: ${email} · ${phone}

## Docs

- [Home](${base}/): Flight search entry and brand overview
- [Destinations hub](${base}/destinations): Curated destination guides
- [About](${base}/about): Who we are and how we book
- [FAQ](${base}/faq): Booking, instalments, and agent support
- [Contact](${base}/contact): Phone, WhatsApp, email, and enquiry form
- [Pay in instalments](${base}/guides/paying-for-flights-in-instalments): How book-now instalment plans work
- [Cheap flights to Africa](${base}/guides/cheap-flights-to-africa): Africa flight guide
- [UK–Nigeria flights guide](${base}/guides/flights-uk-nigeria): Corridor tips and booking notes
- [Tours](${base}/guides/tours): Tours and holiday packages
- [Sitemap](${base}/sitemap.xml): Full indexable URL list
- [Robots](${base}/robots.txt): Crawl rules for search and AI bots

## Popular routes

- [London to Lagos](${base}/flights/london-to-lagos): UK–Nigeria flagship route
- [Lagos to London](${base}/flights/lagos-to-london): Nigeria–UK return corridor
- [London to Abuja](${base}/flights/london-to-abuja): Flights to Nigeria’s capital
- [Abuja to London](${base}/flights/abuja-to-london): Abuja–UK flights
- [Manchester to Lagos](${base}/flights/manchester-to-lagos): North of England–Lagos
- [London to Accra](${base}/flights/london-to-accra): UK–Ghana flights
- [London to Nairobi](${base}/flights/london-to-nairobi): UK–Kenya flights
- [London to Johannesburg](${base}/flights/london-to-johannesburg): UK–South Africa flights

## Popular destinations

- [Lagos](${base}/destinations/lagos): Nigeria’s largest city
- [Abuja](${base}/destinations/abuja): Nigeria capital destination guide
- [Port Harcourt](${base}/destinations/port-harcourt): Port Harcourt travel notes
- [Accra](${base}/destinations/accra): Ghana destination guide
- [Nairobi](${base}/destinations/nairobi): Kenya destination guide
- [London](${base}/destinations/london): London as a UK gateway

## Optional

- [Full destination index](${base}/destinations): Browse all destination pages
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
