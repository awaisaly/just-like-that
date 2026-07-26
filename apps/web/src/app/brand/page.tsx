import Link from 'next/link';
import { AgencyWordmark } from '../../components/AgencyWordmark';
import {
  NAV_WORDMARK_LABELS,
  NAV_WORDMARK_VARIANT,
  NAV_WORDMARK_VARIANTS,
  type NavWordmarkVariant,
} from '../../lib/brand';

export const metadata = {
  title: 'Brand wordmark variants',
  robots: { index: false, follow: false },
};

function NavPreview({ variant }: { variant: NavWordmarkVariant }) {
  return (
    <div className="brand-preview-bar">
      <div className="brand-preview-brand">
        <img
          src="/icon-192.png"
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-[10px] shadow-sm ring-1 ring-black/5"
        />
        <AgencyWordmark size="nav" variant={variant} />
      </div>
      <div className="brand-preview-links" aria-hidden="true">
        <span>Flights</span>
        <span>Destinations</span>
        <span>Contact</span>
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <div className="brand-lab stack">
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          Brand lab
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-navy">Logo & nav marks</h1>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <div className="text-center">
            <img
              src="/icon-192.png"
              alt="Elca Airbridge logo"
              width={96}
              height={96}
              className="mx-auto rounded-[22px] shadow-md ring-1 ring-black/5"
            />
            <p className="mt-2 text-xs font-semibold text-muted">App icon / favicon</p>
          </div>
          <div className="text-center">
            <img
              src="/favicon-32.png"
              alt=""
              width={32}
              height={32}
              className="mx-auto rounded-[7px] shadow-sm ring-1 ring-black/5"
            />
            <p className="mt-2 text-xs font-semibold text-muted">32×32</p>
          </div>
          <div className="text-center">
            <img
              src="/icon.svg"
              alt=""
              width={64}
              height={64}
              className="mx-auto rounded-[14px] shadow-sm ring-1 ring-black/5"
            />
            <p className="mt-2 text-xs font-semibold text-muted">SVG source</p>
          </div>
        </div>
        <h2 className="mt-10 text-xl font-extrabold text-brand-navy">Nav wordmark variants</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Compare styles below. Open any option with{' '}
          <code className="rounded bg-chip px-1.5 py-0.5 text-sm text-brand-navy">?mark=…</code> to
          try it live in the real header, then set{' '}
          <code className="rounded bg-chip px-1.5 py-0.5 text-sm text-brand-navy">
            NAV_WORDMARK_VARIANT
          </code>{' '}
          in <code className="rounded bg-chip px-1.5 py-0.5 text-sm text-brand-navy">lib/brand.ts</code>{' '}
          when you pick a winner. Current default:{' '}
          <strong className="text-brand-navy">{NAV_WORDMARK_VARIANT}</strong>.
        </p>
      </div>

      <div className="brand-lab-grid">
        {NAV_WORDMARK_VARIANTS.map((variant) => (
          <section key={variant} className="brand-lab-card">
            <div className="brand-lab-card-head">
              <div>
                <p className="m-0 text-sm font-extrabold text-brand-navy">{variant}</p>
                <p className="m-0 mt-0.5 text-sm text-muted">{NAV_WORDMARK_LABELS[variant]}</p>
              </div>
              <Link href={`/?mark=${variant}`} className="brand-lab-try">
                Try in header →
              </Link>
            </div>
            <NavPreview variant={variant} />
          </section>
        ))}
      </div>
    </div>
  );
}
