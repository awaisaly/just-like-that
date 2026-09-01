import { AGENCY_NAME } from '../../lib/brand';
import { getPrimaryWhatsAppLine, getSupportEmail } from '../../lib/contact';
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
  const email = getSupportEmail();
  const whatsapp = getPrimaryWhatsAppLine();
  const whatsappLine = whatsapp ? `WhatsApp +${whatsapp.digits}` : null;

  const body = `# ${AGENCY_NAME}

> UK travel agency for cheap flights from London to Lagos and flights to Nigeria from London (and return). Search tickets from Lagos to London and a flight from Nigeria to London on the website, then book with a UK agent — often with instalment plans paid before you fly. The website does not take online payment or issue tickets automatically.

- Brand: ${AGENCY_NAME}
- Focus: UK ↔ Nigeria / Africa flights (also selected worldwide routes)
- Model: Agent-assisted booking after the customer selects a fare
- Fares on screen are indicative until an agent re-confirms
- Contact: ${email}${whatsappLine ? ` · ${whatsappLine}` : ''}

## Docs

- [Home](${base}/): Cheap flights from London to Lagos and Nigeria
- [Destinations hub](${base}/destinations): Curated destination guides
- [About](${base}/about): Who we are and how we book
- [FAQ](${base}/faq): Booking, instalments, and agent support
- [Contact](${base}/contact): Voice call, WhatsApp, email, and enquiry form
- [Pay in instalments](${base}/guides/paying-for-flights-in-instalments): How book-now instalment plans work
- [Cheap flights to Africa](${base}/guides/cheap-flights-to-africa): Africa flight guide
- [Flights to Nigeria from London](${base}/guides/flights-uk-nigeria): UK–Nigeria corridor, both directions
- [Tours](${base}/guides/tours): Tours and holiday packages
- [Sitemap](${base}/sitemap.xml): Full indexable URL list
- [Robots](${base}/robots.txt): Crawl rules for search and AI bots

## Popular routes

- [Cheap flights from London to Lagos](${base}/flights/london-to-lagos): Flight ticket to Nigeria from London
- [Tickets from Lagos to London](${base}/flights/lagos-to-london): Cheap ticket from Lagos to London
- [London to Abuja](${base}/flights/london-to-abuja): Flights to Nigeria’s capital
- [Abuja to London](${base}/flights/abuja-to-london): Flight from Nigeria to London via Abuja
- [Manchester to Lagos](${base}/flights/manchester-to-lagos): North of England–Lagos
- [London to Accra](${base}/flights/london-to-accra): UK–Ghana flights
- [London to Nairobi](${base}/flights/london-to-nairobi): UK–Kenya flights
- [London to Johannesburg](${base}/flights/london-to-johannesburg): UK–South Africa flights

## Popular destinations

- [Lagos](${base}/destinations/lagos): Cheap flights to Lagos from London
- [Abuja](${base}/destinations/abuja): Nigeria capital destination guide
- [Port Harcourt](${base}/destinations/port-harcourt): Port Harcourt travel notes
- [Accra](${base}/destinations/accra): Ghana destination guide
- [Nairobi](${base}/destinations/nairobi): Kenya destination guide
- [London](${base}/destinations/london): Flights from Nigeria to London

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
