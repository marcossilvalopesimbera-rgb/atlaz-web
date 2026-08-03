import type { ReactNode } from 'react';

interface FeatureCardProps {
  label?: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function FeatureCard({ label, title, subtitle, children }: FeatureCardProps) {
  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-900/5">
      {label ? (
        <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">
          {label}
        </div>
      ) : null}
      <div className="text-lg font-semibold text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
