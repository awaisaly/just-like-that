'use client';

import { useEffect, useRef } from 'react';
import { useLiveFlightSearchStore } from '../lib/stores';

/** Distance from viewport top to leave clear — keeps the full "Your search" bar below the sticky nav. */
function chromeOffset() {
  const header = document.querySelector('.site-header');
  if (header instanceof HTMLElement) {
    // Use the live sticky header bottom + gap so nothing clips underneath.
    return header.getBoundingClientRect().bottom + 20;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-chrome-height');
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed + 36 : 100;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function revealTargets() {
  return [document.getElementById('your-search'), document.getElementById('search-results-shell')].filter(
    Boolean,
  ) as HTMLElement[];
}

function showTargets(targets: HTMLElement[]) {
  for (const el of targets) {
    el.classList.add('search-reveal', 'is-revealed');
  }
}

function hideTargetsForAnimation(targets: HTMLElement[]) {
  for (const el of targets) {
    el.classList.remove('is-revealed');
    el.classList.add('search-reveal');
  }
  targets.forEach((el) => void el.offsetWidth);
}

function playReveal(targets: HTMLElement[]) {
  requestAnimationFrame(() => {
    targets.forEach((el, index) => {
      window.setTimeout(() => el.classList.add('is-revealed'), index * 100);
    });
  });
}

function smoothScrollTo(top: number, duration: number, isCancelled: () => boolean) {
  const start = window.scrollY;
  const delta = top - start;
  if (Math.abs(delta) < 2) {
    window.scrollTo(0, top);
    return Promise.resolve();
  }

  const t0 = performance.now();
  return new Promise<void>((resolve) => {
    const tick = (now: number) => {
      if (isCancelled()) {
        resolve();
        return;
      }
      const progress = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, start + delta * easeOutCubic(progress));
      if (progress < 1) window.requestAnimationFrame(tick);
      else resolve();
    };
    window.requestAnimationFrame(tick);
  });
}

/**
 * After an explicit Search (revealNonce + matching cache key), smoothly scrolls
 * to results and plays a reveal animation. Plain loads / refreshes do nothing.
 */
export function SearchScrollTarget({
  active,
  searchKey,
  cacheKey,
}: {
  active: boolean;
  searchKey: string;
  cacheKey: string;
}) {
  const revealNonce = useLiveFlightSearchStore((s) => s.revealNonce);
  const revealForKey = useLiveFlightSearchStore((s) => s.revealForKey);
  const clearReveal = useLiveFlightSearchStore((s) => s.clearReveal);
  const lastHandled = useRef(0);

  useEffect(() => {
    if (!active || !searchKey || !revealNonce) return;
    if (!revealForKey || revealForKey !== cacheKey) return;
    if (revealNonce === lastHandled.current) return;

    // Mark handled only for this mount instance; Strict Mode remount resets the ref
    // and can safely re-run while revealForKey is still armed.
    lastHandled.current = revealNonce;

    let cancelled = false;
    let delayTimer = 0;
    let revealTimer = 0;
    let frame = 0;
    let targets: HTMLElement[] = [];

    const run = async () => {
      await new Promise<void>((resolve) => {
        delayTimer = window.setTimeout(resolve, 100);
      });
      if (cancelled) return;

      const summary = document.getElementById('your-search');
      if (!summary) return;

      targets = revealTargets();
      const top = Math.max(0, summary.getBoundingClientRect().top + window.scrollY - chromeOffset());

      if (prefersReducedMotion()) {
        window.scrollTo({ top, behavior: 'auto' });
        showTargets(targets);
        clearReveal();
        return;
      }

      hideTargetsForAnimation(targets);

      revealTimer = window.setTimeout(() => {
        if (!cancelled) playReveal(targets);
        else showTargets(targets);
      }, 280);

      await smoothScrollTo(top, 900, () => cancelled);

      if (cancelled) {
        showTargets(targets);
        return;
      }

      showTargets(targets);

      // After the reveal transform settles, snap so "Your search" sits just under the nav
      // (not a little too low into the results).
      await new Promise<void>((resolve) => {
        delayTimer = window.setTimeout(resolve, 320);
      });
      if (!cancelled) {
        const el = document.getElementById('your-search');
        if (el) {
          const corrected = Math.max(
            0,
            el.getBoundingClientRect().top + window.scrollY - chromeOffset(),
          );
          if (Math.abs(corrected - window.scrollY) > 6) {
            window.scrollTo({ top: corrected, behavior: 'smooth' });
          }
        }
        clearReveal();
      }
    };

    frame = window.requestAnimationFrame(() => {
      void run();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(delayTimer);
      window.clearTimeout(revealTimer);
      showTargets(targets.length ? targets : revealTargets());
    };
  }, [active, searchKey, cacheKey, revealNonce, revealForKey, clearReveal]);

  return null;
}
