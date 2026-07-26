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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [open]);

  const drawer =
    mounted &&
    createPortal(
      <div className={`nav-drawer-root ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button
          type="button"
          className="nav-drawer-backdrop"
          tabIndex={open ? 0 : -1}
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
              Call {phoneDisplay}
            </a>
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
            {phoneDisplay}
          </a>
        </nav>

        <div className="nav-mobile-actions">
          <a
            href={supportTelHref(supportPhone)}
            className="nav-call-icon"
            aria-label={`Call ${phoneDisplay}`}
          >
            <PhoneIcon />
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M4.2 2.8c.4-.4 1-.5 1.5-.3l2.2.9c.5.2.8.7.7 1.2l-.4 2a1 1 0 0 1-.6.7l-1 .4a9.4 9.4 0 0 0 4.4 4.4l.4-1a1 1 0 0 1 .7-.6l2-.4c.5-.1 1 .2 1.2.7l.9 2.2c.2.5.1 1.1-.3 1.5l-1.3 1.3c-.4.4-1 .6-1.6.5C7.5 16.3 3.7 12.5 2.5 7.2c-.1-.6.1-1.2.5-1.6L4.2 2.8z" />
    </svg>
  );
}
