import type { ReactNode } from 'react';

interface SectionShellProps {
  children: ReactNode;
}

export function SectionShell({ children }: SectionShellProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/30">
        {children}
      </div>
    </div>
  );
}
