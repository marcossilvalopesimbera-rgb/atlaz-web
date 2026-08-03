import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@components/ui/SiteHeader';

export const metadata: Metadata = {
  title: 'ATLAZ',
  description: 'ATLAZ — modern investigation workspace built with production-grade architecture.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-950 antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
