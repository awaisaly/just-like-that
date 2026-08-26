'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  NAV_WORDMARK_VARIANT,
  NAV_WORDMARK_VARIANTS,
  type NavWordmarkVariant,
} from '../lib/brand';
import {
  formatSupportPhone,
  getAdsTrackingPhoneDisplay,
  getAdsTrackingPhoneIfDistinct,
  getSupportPhone,
  supportTelHref,
} from '../lib/contact';
import { INSTALMENTS_HREF, instalmentCopy } from '../lib/instalments';
import { TOURS_HREF } from '../lib/tours';
import { AgencyWordmark } from './AgencyWordmark';

function resolveNavMark(raw: string | null): NavWordmarkVariant {
  if (raw && (NAV_WORDMARK_VARIANTS as readonly string[]).includes(raw)) {
    return raw as NavWordmarkVariant;
  }
  return NAV_WORDMARK_VARIANT;
}

const supportPhone = getSupportPhone();
const phoneDisplay = formatSupportPhone(supportPhone);
const adsTrackingPhone = getAdsTrackingPhoneIfDistinct(supportPhone);
const adsTrackingDisplay = adsTrackingPhone ? getAdsTrackingPhoneDisplay() : null;

const navLinks: Array<{ href: string; label: string }> = [
  { href: '/flights/search', label: 'Flights' },
  { href: '/destinations', label: 'Destinations' },
  { href: TOURS_HREF, label: 'Tours' },
  { href: INSTALMENTS_HREF, label: 'Instalments' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQs' },
  { href: '/contact', label: 'Contact' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const markVariant = resolveNavMark(searchParams.get('mark'));
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const drawerNode = document.getElementById(menuId);

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !drawerNode) return;

      const focusable = Array.from(
        drawerNode.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);

      if (!focusable.length) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [open, menuId]);

  const drawer =
    mounted &&
    createPortal(
      <div className={`nav-drawer-root ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button
          type="button"
          className="nav-drawer-backdrop"
          tabIndex={-1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />

        <div
          id={menuId}
          className="nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="nav-drawer-top">
            <p className="nav-drawer-title">Menu</p>
            <button
              ref={closeRef}
              type="button"
              className="nav-drawer-close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <Link
            href={INSTALMENTS_HREF}
            className="nav-drawer-promise"
            onClick={() => setOpen(false)}
          >
            <span className="nav-drawer-promise-eyebrow">Our primary promise</span>
            <span className="nav-drawer-promise-title">{instalmentCopy.motto}</span>
            <span className="nav-drawer-promise-cta">How it works →</span>
          </Link>

          <nav className="nav-drawer-links" aria-label="Mobile primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-drawer-link ${
                  isActive(pathname, link.href) ? 'is-active' : ''
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-drawer-footer">
            <a href={supportTelHref(supportPhone)} className="nav-drawer-call">
              <span className="nav-call-flag" aria-hidden="true">
                🇬🇧
              </span>
              Call {phoneDisplay}
            </a>
            {adsTrackingPhone && adsTrackingDisplay ? (
              <a href={supportTelHref(adsTrackingPhone)} className="nav-drawer-call">
                <span className="nav-call-flag" aria-hidden="true">
                  🇬🇧
                </span>
                Call {adsTrackingDisplay}
              </a>
            ) : null}
            <Link
              href="/flights/search"
              className="nav-drawer-search"
              onClick={() => setOpen(false)}
            >
              Search flights
            </Link>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          {/* Plain img avoids Next/Image layer flicker inside the fixed mobile chrome. */}
          <img
            src="/icon-192.png"
            alt=""
            width={36}
            height={36}
            className="brand-mark h-9 w-9 shrink-0 rounded-[10px] shadow-sm ring-1 ring-black/5"
            decoding="async"
          />
          <AgencyWordmark size="nav" variant={markVariant} className="brand-text" />
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(pathname, link.href) ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={supportTelHref(supportPhone)}
            className="nav-call"
            aria-label={`Call ${phoneDisplay}`}
          >
            <span className="nav-call-flag" aria-hidden="true">
              🇬🇧
            </span>
            {phoneDisplay}
          </a>
          {adsTrackingPhone && adsTrackingDisplay ? (
            <a
              href={supportTelHref(adsTrackingPhone)}
              className="nav-call"
              aria-label={`Call ${adsTrackingDisplay}`}
            >
              <span className="nav-call-flag" aria-hidden="true">
                🇬🇧
              </span>
              {adsTrackingDisplay}
            </a>
          ) : null}
        </nav>

        <div className="nav-mobile-actions">
          <a
            href={supportTelHref(supportPhone)}
            className="nav-call-icon"
            aria-label={`Call ${phoneDisplay}`}
          >
            <span className="nav-call-flag" aria-hidden="true">
              🇬🇧
            </span>
            <span className="nav-call-icon-label">Call</span>
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="nav-menu-btn"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={`nav-menu-icon ${open ? 'is-open' : ''}`} aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
      {drawer}
    </header>
  );
}
