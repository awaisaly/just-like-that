import type { ReactNode } from 'react';

const INSTALMENT_PHRASE = /(pay(?:ing)? in instalments\.?)/i;

/** Accent highlight for the primary instalment promise — sized to catch the eye. */
export function PayInInstalmentsAccent({
  children = 'Pay in instalments',
  className = 'inline font-extrabold leading-[1.15] tracking-tight text-accent text-[1.22em]',
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

/** Enlarge and colour the instalment phrase inside a heading or label. */
export function InstalmentPhrase({ children }: { children: string }) {
  const match = children.match(INSTALMENT_PHRASE);
  if (!match || match.index === undefined) return children;

  const phrase = match[0];
  return (
    <>
      {children.slice(0, match.index)}
      <PayInInstalmentsAccent>{phrase}</PayInInstalmentsAccent>
      {children.slice(match.index + phrase.length)}
    </>
  );
}
