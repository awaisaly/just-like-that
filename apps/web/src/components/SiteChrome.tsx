import { Suspense } from 'react';
import { InstalmentBar } from './Instalments';
import { SiteHeader } from './SiteHeader';

/**
 * Promo strip scrolls away; nav sticks to the viewport.
 * Wrapper uses display:contents so sticky is not trapped in a short parent box.
 */
export function SiteChrome() {
  return (
    <div className="site-chrome">
      <InstalmentBar />
      <Suspense fallback={<header className="site-header" aria-hidden="true" />}>
        <SiteHeader />
      </Suspense>
    </div>
  );
}
