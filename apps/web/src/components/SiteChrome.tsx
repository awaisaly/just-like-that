import { Suspense } from 'react';
import { SiteHeader } from './SiteHeader';

/**
 * Nav sticks to the viewport.
 * Wrapper uses display:contents so sticky is not trapped in a short parent box.
 */
export function SiteChrome() {
  return (
    <div className="site-chrome">
      <Suspense fallback={<header className="site-header" aria-hidden="true" />}>
        <SiteHeader />
      </Suspense>
    </div>
  );
}
