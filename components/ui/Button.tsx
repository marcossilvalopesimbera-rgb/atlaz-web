import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const accentColor = '#5B5CEB';

const variantStyles = {
  primary:
    `group inline-flex items-center justify-center rounded-full bg-slate-950 px-12 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)] transition-transform duration-200 transform hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_14px_40px_-28px_rgba(15,23,42,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5B5CEB]/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:-translate-y-0`,
  secondary:
    `group inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 transform hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#5B5CEB]/10 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:-translate-y-0`,
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${variantStyles[variant]} ${className}`}
      style={variant === 'primary' ? { borderColor: accentColor } : undefined}
      {...props}
    />
  );
}
