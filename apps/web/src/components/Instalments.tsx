import Link from 'next/link';
import { INSTALMENTS_HREF, instalmentCopy } from '../lib/instalments';

/** Persistent sitewide strip — primary brand reminder. */
export function InstalmentBar() {
  return (
    <div className="instalment-bar" role="region" aria-label="Pay in instalments">
      <Link href={INSTALMENTS_HREF} className="instalment-bar-inner">
        <p className="instalment-bar-text">
          <span className="instalment-bar-lead">{instalmentCopy.barLead}</span>
          <span className="instalment-bar-dot" aria-hidden>
            ·
          </span>
          <span className="instalment-bar-action">{instalmentCopy.barAction}</span>
        </p>
        <span className="instalment-bar-cta">
          <span className="hidden sm:inline">{instalmentCopy.barCta}</span>
          <span className="sm:hidden">How</span>
          <span aria-hidden>→</span>
        </span>
      </Link>
    </div>
  );
}

/** Compact mark for offer cards and price areas. */
export function InstalmentMark({ className = '' }: { className?: string }) {
  return (
    <span className={`instalment-mark ${className}`.trim()}>
      <span className="instalment-mark-pulse" aria-hidden />
      {instalmentCopy.markHint}
    </span>
  );
}

/** Inline note under prices. */
export function InstalmentPriceNote({ className = '' }: { className?: string }) {
  return (
    <p className={`instalment-price-note ${className}`.trim()}>
      {instalmentCopy.priceNote}
    </p>
  );
}

type SpotlightProps = {
  className?: string;
  /** Tighter padding for embedding under search / forms. */
  compact?: boolean;
};

/** Full-width promise section for home and key pages. */
export function InstalmentSpotlight({ className = '', compact = false }: SpotlightProps) {
  return (
    <section
      className={`instalment-spotlight full-bleed-x ${compact ? 'instalment-spotlight-compact' : ''} ${className}`.trim()}
      aria-labelledby="instalment-spotlight-title"
    >
      <div className="instalment-spotlight-inner">
        <div className="instalment-spotlight-copy">
          <p className="instalment-spotlight-eyebrow">Our primary promise</p>
          <h2 id="instalment-spotlight-title" className="instalment-spotlight-title">
            {instalmentCopy.spotlightTitle}
          </h2>
          <p className="instalment-spotlight-body">{instalmentCopy.spotlightBody}</p>
          <div className="instalment-spotlight-actions">
            <Link href="/flights/search" className="instalment-btn-primary">
              Search flights
            </Link>
            <Link href={INSTALMENTS_HREF} className="instalment-btn-ghost">
              How instalments work
            </Link>
          </div>
        </div>

        <ol className="instalment-steps">
          {instalmentCopy.steps.map((step) => (
            <li key={step.n} className="instalment-step">
              <span className="instalment-step-n" aria-hidden>
                {step.n}
              </span>
              <div>
                <p className="instalment-step-title">{step.title}</p>
                <p className="instalment-step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Slim reminder strip for footers and page bottoms. */
export function InstalmentFooterBand() {
  return (
    <div className="instalment-footer-band">
      <p className="instalment-footer-motto">{instalmentCopy.footerLine}</p>
      <Link href={INSTALMENTS_HREF} className="instalment-footer-link">
        See how it works →
      </Link>
    </div>
  );
}
