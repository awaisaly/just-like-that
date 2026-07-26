import {
  AGENCY_NAME,
  NAV_WORDMARK_VARIANT,
  type NavWordmarkVariant,
} from '../lib/brand';

type AgencyWordmarkProps = {
  size?: 'nav' | 'hero' | 'footer';
  /** Nav-only style. Defaults to `NAV_WORDMARK_VARIANT`. */
  variant?: NavWordmarkVariant;
  className?: string;
};

function BridgeGlyph() {
  return (
    <svg
      className="agency-mark-bridge-glyph"
      viewBox="0 0 28 12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 9c6-7 12-7 18 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M5 9c4.5-4.5 9.5-4.5 14 0"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="3.2" r="1.7" fill="var(--color-brand)" />
    </svg>
  );
}

/** Styled agency wordmark: Elca + Airbridge. */
export function AgencyWordmark({
  size = 'nav',
  variant = NAV_WORDMARK_VARIANT,
  className = '',
}: AgencyWordmarkProps) {
  const cls = `agency-mark agency-mark-${size}${
    size === 'nav' ? ` agency-mark-v-${variant}` : ''
  }${className ? ` ${className}` : ''}`;

  if (size === 'nav') {
    if (variant === 'stack') {
      return (
        <span className={cls} aria-label={AGENCY_NAME}>
          <span className="agency-mark-elca">Elca</span>
          <span className="agency-mark-air">
            Airbridge
            <span className="agency-mark-underline" aria-hidden="true" />
          </span>
        </span>
      );
    }

    if (variant === 'bridge') {
      return (
        <span className={cls} aria-label={AGENCY_NAME}>
          <span className="agency-mark-elca">Elca</span>
          <BridgeGlyph />
          <span className="agency-mark-air">Airbridge</span>
        </span>
      );
    }

    if (variant === 'caps') {
      return (
        <span className={cls} aria-label={AGENCY_NAME}>
          <span className="agency-mark-elca">Elca</span>
          <span className="agency-mark-air">Airbridge</span>
        </span>
      );
    }

    if (variant === 'split') {
      return (
        <span className={cls} aria-label={AGENCY_NAME}>
          <span className="agency-mark-elca">Elca</span>
          <span className="agency-mark-air">Airbridge</span>
        </span>
      );
    }

    // inline + solid share the same markup
    return (
      <span className={cls} aria-label={AGENCY_NAME}>
        <span className="agency-mark-elca">Elca</span>
        {variant === 'inline' ? <span className="agency-mark-dot" aria-hidden="true" /> : null}
        <span className="agency-mark-air">Airbridge</span>
      </span>
    );
  }

  return (
    <span className={cls} aria-label={AGENCY_NAME}>
      <span className="agency-mark-elca">Elca</span>
      <span className="agency-mark-sep" aria-hidden="true" />
      <span className="agency-mark-air">Airbridge</span>
    </span>
  );
}
