'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

/** Cinematic hero entrance — image settles, copy and search cascade in. */
export function HomeHero({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setReady(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <div className={`home-hero${ready ? ' is-ready' : ''}`}>{children}</div>
  );
}

/** Scroll-triggered reveal for sections and staggered grids. */
export function HomeInView({
  children,
  className = '',
  stagger = false,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const style = delayMs
    ? ({ '--home-delay': `${delayMs}ms` } as CSSProperties)
    : undefined;

  return (
    <div
      ref={ref}
      style={style}
      className={[
        'home-inview',
        stagger ? 'home-inview-stagger' : '',
        visible ? 'is-in' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export function HomeStaggerItem({
  children,
  className = '',
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={`home-stagger-item ${className}`.trim()}
      style={{ '--home-i': index } as CSSProperties}
    >
      {children}
    </div>
  );
}
