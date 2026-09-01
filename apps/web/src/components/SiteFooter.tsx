import Link from 'next/link';
import { InstalmentFooterBand } from './Instalments';
import { PayInInstalmentsAccent } from './InstalmentAccent';
import {
  destinationHref,
  destinationRegionOrder,
  getDestinationsByRegion,
} from '../data/destinations';
import { findAirport } from '../data/airports';
import { getSeoPagesByType, seoPath } from '../data/seo-pages';
import { AGENCY_NAME } from '../lib/brand';
import {
  getSupportEmail,
  getWhatsAppLines,
  supportMailtoHref,
  whatsappChatHref,
} from '../lib/contact';
import { INSTALMENTS_HREF, instalmentCopy } from '../lib/instalments';
import { TOURS_HREF } from '../lib/tours';
import { AgencyWordmark } from './AgencyWordmark';
import { WhatsAppChannelIcon } from './ContactChannelIcons';

function VisaBadge() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" role="img" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="12"
        fontWeight="700"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardBadge() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" role="img" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path
        d="M24 10.2a8 8 0 0 1 0 11.6 8 8 0 0 1 0-11.6z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexBadge() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" role="img" aria-label="American Express">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="8"
        fontWeight="700"
      >
        AMEX
      </text>
    </svg>
  );
}

function IataBadge() {
  return (
    <svg viewBox="0 0 56 32" className="h-7 w-auto" role="img" aria-label="IATA">
      <rect width="56" height="32" rx="4" fill="#fff" stroke="#10193a" strokeWidth="1.5" />
      <text
        x="28"
        y="14"
        textAnchor="middle"
        fill="#10193a"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="9"
        fontWeight="800"
      >
        IATA
      </text>
      <text
        x="28"
        y="24"
        textAnchor="middle"
        fill="#64748b"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="5.5"
        fontWeight="600"
      >
        ACCREDITED
      </text>
    </svg>
  );
}

function AtolBadge() {
  return (
    <svg viewBox="0 0 56 32" className="h-7 w-auto" role="img" aria-label="ATOL">
      <rect width="56" height="32" rx="4" fill="#0B3D91" />
      <text
        x="28"
        y="14"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="9"
        fontWeight="800"
      >
        ATOL
      </text>
      <text
        x="28"
        y="24"
        textAnchor="middle"
        fill="#B8D0F5"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="5.5"
        fontWeight="600"
      >
        PROTECTED
      </text>
    </svg>
  );
}

function SecureBadge() {
  return (
    <span className="footer-trust-pill" title="Secure agent booking">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          fill="currentColor"
          d="M8 1.5 3 3.5v4.2c0 3.1 2.1 5.9 5 6.8 2.9-.9 5-3.7 5-6.8V3.5L8 1.5zm0 1.7 3.5 1.4v3.1c0 2.2-1.4 4.2-3.5 5-2.1-.8-3.5-2.8-3.5-5V4.6L8 3.2z"
        />
      </svg>
      Secure booking
    </span>
  );
}

function UkBadge() {
  return (
    <span className="footer-trust-pill" title="UK travel agency">
      UK travel agency
    </span>
  );
}

export function SiteFooter() {
  const supportEmail = getSupportEmail();
  const whatsappLines = getWhatsAppLines();
  const whatsappMessage = `Hi, I have a question about flights on ${AGENCY_NAME}.`;

  const destinationRegions = destinationRegionOrder
    .map((region) => ({
      region,
      destinations: getDestinationsByRegion(region),
    }))
    .filter((group) => group.destinations.length > 0);
  const routes = getSeoPagesByType('route').slice(0, 12);
  const guides = getSeoPagesByType('guide');

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <section className="footer-destinations" aria-labelledby="footer-destinations-title">
          <div className="footer-destinations-head">
            <h2 id="footer-destinations-title" className="footer-col-title">
              Destinations
            </h2>
            <Link href="/destinations" className="footer-destinations-all">
              View all →
            </Link>
          </div>
          <div className="footer-dest-regions">
            {destinationRegions.map(({ region, destinations }) => (
              <div key={region} className="footer-dest-region">
                <h3 className="footer-dest-region-title">{region}</h3>
                <ul className="footer-dest-chips">
                  {destinations.map((dest) => (
                    <li key={dest.slug}>
                      <Link href={destinationHref(dest.slug)} title={`Flights to ${dest.city}`}>
                        {dest.city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="footer-secondary-grid">
          <div>
            <h2 className="footer-col-title">Popular routes</h2>
            <ul className="footer-link-list footer-link-list-dense">
              {routes.map((route) => {
                const origin = route.route?.originIata ?? '';
                const destination = route.route?.destinationIata ?? '';
                const fromCity = findAirport(origin)?.city ?? origin;
                const toCity = findAirport(destination)?.city ?? destination;
                return (
                  <li key={route.slug}>
                    <Link
                      href={seoPath(route)}
                      title={
                        route.slug === 'london-to-lagos'
                          ? 'Cheap flights from London to Lagos'
                          : route.slug === 'lagos-to-london'
                            ? 'Tickets from Lagos to London'
                            : `Flights from ${fromCity} to ${toCity}`
                      }
                    >
                      {route.slug === 'london-to-lagos'
                        ? 'Cheap flights from London to Lagos'
                        : route.slug === 'lagos-to-london'
                          ? 'Tickets from Lagos to London'
                          : `${fromCity} → ${toCity}`}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href="/flights/search">Search all flights</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-col-title">Travel help</h2>
            <ul className="footer-link-list footer-link-list-dense">
              <li>
                <Link href={TOURS_HREF}>Tours & packages</Link>
              </li>
              <li>
                <Link href={INSTALMENTS_HREF}>
                  <PayInInstalmentsAccent>Pay in instalments</PayInInstalmentsAccent>
                </Link>
              </li>
              <li>
                <Link href="/about">About us</Link>
              </li>
              <li>
                <Link href="/faq">FAQs</Link>
              </li>
              <li>
                <Link href="/destinations">All destinations</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
              {guides
                .filter(
                  (guide) =>
                    guide.slug !== 'paying-for-flights-in-instalments' && guide.slug !== 'tours',
                )
                .map((guide) => (
                  <li key={guide.slug}>
                    <Link href={seoPath(guide)}>{guide.h1}</Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <InstalmentFooterBand />

        <div className="footer-trust">
          <div>
            <p className="footer-trust-label">We accept</p>
            <div className="footer-trust-row" aria-label="Accepted payment cards">
              <VisaBadge />
              <MastercardBadge />
              <AmexBadge />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted">
              Card payments are taken securely when you book with a UK agent — not on this website.
            </p>
          </div>

          <div>
            <p className="footer-trust-label">Accreditation & trust</p>
            <div className="footer-trust-row" aria-label="Travel agency trust marks">
              <AtolBadge />
              <IataBadge />
              <SecureBadge />
              <UkBadge />
            </div>
          </div>
        </div>

        <section className="footer-contact" aria-labelledby="footer-contact-title">
          <div className="footer-contact-copy">
            <p className="footer-contact-eyebrow">UK travel agency</p>
            <h2 id="footer-contact-title" className="footer-contact-title">
              Talk to a booking agent
            </h2>
            <p className="footer-contact-text">
              Prefer to speak with someone? WhatsApp or email — we help with fares, instalments,
              and callbacks.
            </p>
          </div>
          <div className="footer-contact-actions">
            <a href={supportMailtoHref(supportEmail)} className="footer-contact-action is-email">
              <span className="footer-contact-action-label">Email</span>
              <span className="footer-contact-action-value">{supportEmail}</span>
            </a>
            {whatsappLines.map((line) => (
              <a
                key={line.digits}
                href={whatsappChatHref(line.digits, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-action is-whatsapp"
              >
                <span className="footer-contact-action-label">
                  <WhatsAppChannelIcon />
                  {line.label}
                </span>
                <span className="footer-contact-action-value">
                  <span className="footer-contact-flag" aria-hidden="true">
                    🇬🇧
                  </span>
                  <span>{line.display}</span>
                </span>
              </a>
            ))}
            <Link href="/contact" className="footer-contact-action is-form">
              <span className="footer-contact-action-label">Send a message</span>
              <span className="footer-contact-action-value">Contact form →</span>
            </Link>
          </div>
        </section>

        <div className="footer-bottom">
          <div>
            <p className="m-0">
              <AgencyWordmark size="footer" />
            </p>
            <p className="mt-1 text-xs text-muted">
              {instalmentCopy.footerLine} · agent-assisted
            </p>
            <p className="mt-1 text-xs">
              <Link href={INSTALMENTS_HREF} className="font-semibold text-accent hover:underline">
                How instalments work →
              </Link>
            </p>
          </div>
          <p className="m-0 text-xs text-muted">
            © {new Date().getFullYear()} {AGENCY_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
