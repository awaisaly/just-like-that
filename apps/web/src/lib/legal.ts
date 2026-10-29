import { AGENCY_NAME } from './brand';
import { DEFAULT_SUPPORT_EMAIL } from './contact';

export type LegalInline = string | { label: string; href: string };

export type LegalBlock =
  | { type: 'p'; content: LegalInline[] }
  | { type: 'ul'; items: LegalInline[][] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalPage = {
  slug: 'terms' | 'privacy' | 'returns';
  path: string;
  navLabel: string;
  title: string;
  kicker: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

const email = DEFAULT_SUPPORT_EMAIL;

function p(...content: LegalInline[]): LegalBlock {
  return { type: 'p', content };
}

function ul(items: LegalInline[][]): LegalBlock {
  return { type: 'ul', items };
}

export const legalPages: LegalPage[] = [
  {
    slug: 'terms',
    path: '/terms',
    navLabel: 'Terms of service',
    title: 'Terms of service',
    kicker: 'Website and booking terms',
    description: `Terms for using the ${AGENCY_NAME} website and booking flights with a UK agent, including indicative fares.`,
    updated: '13 October 2026',
    sections: [
      {
        id: 'who-we-are',
        title: 'Who we are',
        blocks: [
          p(
            `${AGENCY_NAME} (“we”, “us”) is a UK travel desk. This website lets you compare flight options and then arrange a booking with one of our agents.`,
          ),
          p(
            'We do not take card payments on this website, and we do not issue tickets automatically when you select a fare. A booking is made when an agent confirms it with you.',
          ),
          p(
            'These terms cover use of the website and the agent-assisted booking service. The airline’s conditions of carriage, and any fare rules attached to the ticket, also apply once a ticket is issued.',
          ),
        ],
      },
      {
        id: 'using-the-site',
        title: 'Using this website',
        blocks: [
          p(
            'You may use the site to search routes, read guides, and contact us by WhatsApp, phone, or email. You must be able to enter a contract for the travellers on the booking, or have authority from the person who will pay.',
          ),
          p('You agree not to:'),
          ul([
            ['misuse the search, scrape fares at a volume that degrades the service, or try to break security;'],
            ['submit false passenger, contact, or payment details;'],
            ['use the site for any unlawful purpose.'],
          ]),
          p(
            'We may suspend access, withdraw a fare display, or refuse a booking where we reasonably believe details are incomplete, the fare is no longer available, or continuing would breach airline rules or the law.',
          ),
        ],
      },
      {
        id: 'fares',
        title: 'Fares shown on screen',
        blocks: [
          p(
            'Prices, baggage, seats, and timings on search results are indicative. They come from airline distribution systems and can change or sell out before an agent re-checks them.',
          ),
          p(
            'A listed fare is the price to pay in full. Your agent confirms that amount before you pay.',
          ),
          p(
            'Taxes and carrier charges included in a quoted total can still change if the airline reprices the ticket. We will not ask you to pay a higher fare without telling you first and getting your agreement.',
          ),
        ],
      },
      {
        id: 'how-booking-works',
        title: 'How a booking is made',
        blocks: [
          p('A typical booking works like this:'),
          ul([
            ['You search and select a flight. We keep that selection in your browser for the session.'],
            ['You WhatsApp, call, or email us. The message can include the itinerary you selected.'],
            ['An agent re-checks availability, baggage, and the fare, then tells you the amount and how you can pay.'],
            ['You agree, and payment is taken with the agent — not through a checkout on this website.'],
            ['We book or ticket only after that agreement. You will receive confirmation by email, WhatsApp, or both.'],
          ]),
          p(
            'Until the agent confirms the booking and payment is agreed, you do not have a confirmed ticket. Selecting a flight on the site does not hold a seat with the airline.',
          ),
        ],
      },
      {
        id: 'your-responsibilities',
        title: 'Your responsibilities',
        blocks: [
          p('You are responsible for:'),
          ul([
            [
              'passenger names that match the passport or travel document exactly, including infants;',
            ],
            ['passport validity, visas, transit rules, and entry requirements for every country on the trip;'],
            ['arriving in time for check-in and giving the airline any documents it asks for;'],
            ['telling us promptly if contact details or travel dates change.'],
          ]),
          p(
            'Airlines often charge to correct a name, and some tickets cannot be changed at all. We pass on those rules before you pay when the airline makes them available.',
          ),
        ],
      },
      {
        id: 'changes-and-refunds',
        title: 'Changes, cancellations, and refunds',
        blocks: [
          p(
            'Whether a ticket can be changed or refunded depends on the airline and the fare brand. Many discounted fares are non-refundable. The position for your ticket is in our ',
            { label: 'Return policy', href: '/returns' },
            '.',
          ),
          p(
            'For a flight on a specific date, the usual 14-day cooling-off period for distance contracts does not apply. Please check the fare rules with your agent before you pay.',
          ),
        ],
      },
      {
        id: 'liability',
        title: 'Our role and liability',
        blocks: [
          p(
            'We arrange transport and related services with airlines and other suppliers. The airline is responsible for operating the flight. Its conditions of carriage govern delays, denied boarding, and baggage claims against the carrier.',
          ),
          p(
            'We are responsible for providing our agency service with reasonable care. Nothing in these terms limits liability for death or personal injury caused by negligence, or for fraud, or for any other liability that the law of England and Wales does not allow us to exclude.',
          ),
          p(
            'Subject to that, we are not liable for indirect or consequential loss, or for loss that arises because an airline, airport, or other supplier fails to perform, except where the Package Travel and Linked Travel Arrangements Regulations 2018 make us responsible for a package we have sold you.',
          ),
        ],
      },
      {
        id: 'intellectual-property',
        title: 'Intellectual property',
        blocks: [
          p(
            `The ${AGENCY_NAME} name, logo, page design, and original copy on this site belong to us or our licensors. You may not copy them for your own commercial site. Flight data shown in search is supplied for your personal booking enquiry.`,
          ),
        ],
      },
      {
        id: 'law',
        title: 'Governing law',
        blocks: [
          p(
            'These terms are governed by the law of England and Wales. The courts of England and Wales will hear disputes, except that if you live in another part of the United Kingdom you may also use your local courts where consumer law gives you that right.',
          ),
          p(
            'We may update these terms by posting a new version on this page. The date at the top is the version that applies. A booking already confirmed stays on the terms you were given at the time you agreed to pay.',
          ),
        ],
      },
      {
        id: 'contact',
        title: 'Contact',
        blocks: [
          p(
            'Questions about these terms: ',
            { label: email, href: `mailto:${email}` },
            ', or the ',
            { label: 'Contact page', href: '/contact' },
            '. How we handle personal information is in our ',
            { label: 'Privacy policy', href: '/privacy' },
            '.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    path: '/privacy',
    navLabel: 'Privacy policy',
    title: 'Privacy policy',
    kicker: 'UK GDPR',
    description: `How ${AGENCY_NAME} collects, uses, and shares personal information when you search flights or contact a UK agent.`,
    updated: '13 October 2026',
    sections: [
      {
        id: 'controller',
        title: 'Who is responsible',
        blocks: [
          p(
            `${AGENCY_NAME} is the controller of personal information collected through this website and when you book with our agents.`,
          ),
          p(
            'Contact us at ',
            { label: email, href: `mailto:${email}` },
            ' or via the ',
            { label: 'Contact page', href: '/contact' },
            '. You can also complain to the Information Commissioner’s Office (ICO) at ico.org.uk. We would like the chance to put things right first.',
          ),
        ],
      },
      {
        id: 'what-we-collect',
        title: 'Information we collect',
        blocks: [
          p('Depending on how you use the site, we may hold:'),
          ul([
            [
              'Search details: origin, destination, dates, number of travellers, and cabin, so we can show fares.',
            ],
            [
              'A selected itinerary stored in your browser session, so the offer page and WhatsApp message can include that flight.',
            ],
            [
              'Contact details you give us: name, email, phone number, and the content of WhatsApp, email, or callback messages.',
            ],
            [
              'Booking details once you proceed: passenger names, dates of birth where the airline requires them, and payment status agreed with the agent. Card numbers are taken by the agent’s payment process, not typed into this public website.',
            ],
            [
              'Technical data: IP address, browser type, pages viewed, and cookie identifiers used for security and advertising measurement.',
            ],
          ]),
        ],
      },
      {
        id: 'how-we-use-it',
        title: 'How we use it',
        blocks: [
          p('We use personal information to:'),
          ul([
            ['show live or cached fares and the flight you selected;'],
            ['reply on WhatsApp, email, or the phone and set up a booking;'],
            ['issue tickets through airline systems and send you confirmation;'],
            ['handle changes, refunds, and complaints;'],
            ['measure advertising (for example Google Ads clicks on WhatsApp) and keep the site secure;'],
            ['meet legal and accounting duties.'],
          ]),
          p('We do not sell your personal information.'),
        ],
      },
      {
        id: 'lawful-bases',
        title: 'Lawful bases',
        blocks: [
          p('Under UK GDPR we rely on:'),
          ul([
            [
              'Contract — to take the steps you ask for before a booking, and to perform a booking once you agree to it.',
            ],
            [
              'Legitimate interests — to secure the site, understand which pages and adverts lead to enquiries, and improve the service, where those interests are not overridden by your rights.',
            ],
            [
              'Legal obligation — where we must keep records for tax, consumer, or travel-trade rules.',
            ],
            [
              'Consent — only where we have actually asked for it. You can block or delete advertising cookies in your browser, and you can still search and contact us if you do.',
            ],
          ]),
        ],
      },
      {
        id: 'sharing',
        title: 'Who we share it with',
        blocks: [
          p('We share information only as needed to run the service:'),
          ul([
            [
              'Airlines and distribution partners (including Duffel, where a search is live) so a fare can be priced and a ticket issued.',
            ],
            ['WhatsApp (Meta) when you start a chat from a link on this site.'],
            ['Email delivery used to send enquiry or booking messages to our desk and to you.'],
            ['Google, when the site loads Google Tag Manager or Google Ads tags, as described under cookies.'],
            ['Professional advisers or authorities when the law requires it.'],
          ]),
          p(
            'Suppliers act as our processors or as independent controllers of their own services (airlines and WhatsApp are examples of independent controllers).',
          ),
        ],
      },
      {
        id: 'transfers',
        title: 'International transfers',
        blocks: [
          p(
            'Airlines, WhatsApp, Google, and flight-distribution systems may process data outside the United Kingdom, under those suppliers’ own terms. A transfer of that kind relies on the tool in the supplier’s terms, such as an adequacy decision or standard contractual clauses, where UK GDPR requires one.',
          ),
        ],
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        blocks: [
          p(
            'A selected flight in your browser lasts for that session only. Enquiry messages are kept long enough to answer you and, if you book, for the life of the trip plus the period we need for refunds, complaints, and tax records — usually up to six years for accounting records.',
          ),
          p(
            'Server logs and advertising identifiers are kept for a shorter period, in line with the tool that sets them (often up to 14 months for analytics-style cookies).',
          ),
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies and similar technology',
        blocks: [
          p('We use:'),
          ul([
            [
              'Strictly necessary storage — session storage so your selected flight is still there when you open the offer page.',
            ],
            [
              'Advertising and measurement — Google Tag Manager and the Google Ads tag (including conversion events when you click WhatsApp). These can set cookies to see whether an advert led to a visit or a click.',
            ],
          ]),
          p(
            'You can block or delete cookies in your browser. If you block necessary storage, the selected-flight page may not remember the fare. Blocking advertising cookies does not stop you searching or contacting us.',
          ),
        ],
      },
      {
        id: 'your-rights',
        title: 'Your rights',
        blocks: [
          p(
            'You may ask for a copy of your personal information, ask us to correct it, erase it, restrict it, or transfer it, and you may object to processing based on legitimate interests. Where we rely on consent, you can withdraw it at any time.',
          ),
          p(
            'We may need to keep some booking records even after an erasure request, where the law or an ongoing refund requires it. Write to ',
            { label: email, href: `mailto:${email}` },
            ' and we will respond within one month, unless the request is complex.',
          ),
        ],
      },
      {
        id: 'children',
        title: 'Children',
        blocks: [
          p(
            'This site is aimed at adults arranging travel. We do not knowingly collect account data from children. A child may be a passenger on a booking an adult makes. The adult is responsible for having authority to give that child’s details.',
          ),
        ],
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        blocks: [
          p(
            'We will post any update on this page and change the date at the top. If a change materially affects a booking already under way, we will also tell you by email or WhatsApp where we have those details.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'returns',
    path: '/returns',
    navLabel: 'Return policy',
    title: 'Return policy',
    kicker: 'Changes, cancellations, and refunds',
    description: `How ${AGENCY_NAME} handles flight changes, cancellations, and refunds after you book with a UK agent.`,
    updated: '13 October 2026',
    sections: [
      {
        id: 'what-this-covers',
        title: 'What this policy covers',
        blocks: [
          p(
            'Flight tickets are a service, not goods you can post back. This return policy explains when money can be refunded and when a date or name can be changed.',
          ),
          p(
            'The airline fare rules on your ticket decide most outcomes. Those rules are part of the contract once the ticket is issued. Where this page and the fare rules differ, the fare rules control the airline’s charges, and this page controls how we handle our own service fee.',
          ),
        ],
      },
      {
        id: 'before-you-pay',
        title: 'Before you pay',
        blocks: [
          p(
            'Nothing is charged on this website. Your agent confirms the fare and whether it is refundable or changeable before you pay. Please do not pay until you have heard that explanation.',
          ),
          p(
            'If you decide not to go ahead before any payment is taken and before a ticket is issued, there is nothing to refund.',
          ),
        ],
      },
      {
        id: 'fare-rules',
        title: 'Airline fare rules',
        blocks: [
          p('After ticketing, a request usually falls into one of these groups:'),
          ul([
            [
              'Refundable fare — the airline returns the unused fare, sometimes minus an airline penalty. Taxes may be refundable even when the base fare is not.',
            ],
            [
              'Non-refundable fare — the base fare is kept by the airline. You may still recover unused government taxes where the airline allows it.',
            ],
            [
              'Changeable fare — dates or flights can be moved, usually with an airline change fee plus any fare difference.',
            ],
            [
              'Non-changeable fare — dates cannot be moved. A new ticket is required.',
            ],
            [
              'Name correction — limited. Some airlines allow a small spelling fix for a fee; others treat a name change as a new ticket.',
            ],
          ]),
          p(
            '“Refundable” and “Changeable” labels on a search result are a guide from the airline feed. Your agent re-checks them before you pay.',
          ),
        ],
      },
      {
        id: 'how-to-ask',
        title: 'How to ask for a change or refund',
        blocks: [
          p(
            'Contact us on WhatsApp, by email at ',
            { label: email, href: `mailto:${email}` },
            ', or from the ',
            { label: 'Contact page', href: '/contact' },
            '. Include the passenger names, route, travel date, and any booking reference we sent you.',
          ),
          p(
            'Ask as soon as you can. A cheaper outcome is often available before departure than after a no-show. We submit the request to the airline or consolidator and tell you the charges before we proceed, where the airline gives us that figure in advance.',
          ),
          p(
            'Airline refunds commonly take several weeks after the carrier approves them. We pass the refund to the original payer once we receive it. We do not hold your refund as a credit unless you ask us to.',
          ),
        ],
      },
      {
        id: 'if-you-cancel',
        title: 'If you cancel',
        blocks: [
          p(
            'If you cancel, the refund is the amount the airline actually returns, after any airline penalty. Amounts you have already paid are set against that calculation. If the airline’s non-refundable charges are higher than what you have paid, the agent tells you the shortfall and asks you to agree it before taking anything further.',
          ),
          p(
            'Airline penalties are set by the fare rules, not by us.',
          ),
        ],
      },
      {
        id: 'schedule-changes',
        title: 'If the airline changes the flight',
        blocks: [
          p(
            'If the airline cancels, retimes, or reroutes a flight, we contact you using the details on the booking and explain the options the airline offers — typically an alternative flight or a refund of the unused ticket under the airline’s policy.',
          ),
          p(
            'Rights under UK and EU denied-boarding and cancellation rules, where they apply to your itinerary, sit with the operating airline. We will help you understand the option you have been given.',
          ),
        ],
      },
      {
        id: 'packages',
        title: 'Packages and tours',
        blocks: [
          p(
            'If we sell you a package (for example a flight and hotel sold together as a package), the Package Travel and Linked Travel Arrangements Regulations 2018 may give you additional cancellation and refund rights. Your agent will say when those regulations apply before you pay. A flight-only ticket is not a package.',
          ),
        ],
      },
      {
        id: 'no-cooling-off',
        title: 'No 14-day cooling-off on dated travel',
        blocks: [
          p(
            'Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, the 14-day cancellation right does not apply to passenger transport for a specific date. Please treat payment as a commitment to that ticket, subject only to the fare rules and this policy.',
          ),
        ],
      },
      {
        id: 'contact',
        title: 'Contact',
        blocks: [
          p(
            'Start a refund or change with ',
            { label: email, href: `mailto:${email}` },
            ' or the ',
            { label: 'Contact page', href: '/contact' },
            '. Booking conditions are in our ',
            { label: 'Terms of service', href: '/terms' },
            '.',
          ),
        ],
      },
    ],
  },
];

export function getLegalPage(slug: LegalPage['slug']): LegalPage {
  const page = legalPages.find((item) => item.slug === slug);
  if (!page) throw new Error(`Unknown legal page: ${slug}`);
  return page;
}
