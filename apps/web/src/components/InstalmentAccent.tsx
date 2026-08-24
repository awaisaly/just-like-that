import type { ReactNode } from 'react';

/** Accent highlight for the primary instalment promise on dark hero imagery. */
export function PayInInstalmentsAccent({
  children = 'Pay in instalments',
  className = 'font-semibold text-accent',
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}

/** “Book now. Pay in instalments.” with the second sentence in accent orange. */
export function InstalmentMottoAccent({
  className,
}: {
  className?: string;
}) {
  return (
    <span className={className}>
      Book now. <PayInInstalmentsAccent>Pay in instalments.</PayInInstalmentsAccent>
    </span>
  );
}
