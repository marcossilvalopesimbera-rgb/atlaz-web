import type { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function SectionHeading({ title, description, children }: SectionHeadingProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-2 max-w-2xl text-base text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
