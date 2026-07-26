import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  accent: 'bg-accent text-white hover:bg-accent-dark',
  secondary: 'border border-brand bg-white text-brand hover:bg-chip',
  danger: 'bg-red-700 text-white hover:bg-red-800',
} as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
