import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@components/ui/SiteHeader';
import { buildPageMetadata } from '@/lib/seo';
import { StructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'ATLAZ',
  description: 'ATLAZ é uma plataforma de investigação cognitiva para transformar problemas complexos em hipóteses, evidências e decisões rastreáveis.',
  path: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ATLAZ',
    url: 'https://atlaz.ai',
    logo: 'https://atlaz.ai/og-image.svg',
    sameAs: ['https://www.linkedin.com'],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ATLAZ',
    url: 'https://atlaz.ai',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://atlaz.ai/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ATLAZ',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Plataforma de investigação cognitiva para transformar problemas em hipóteses, evidências e decisões rastreáveis.',
    url: 'https://atlaz.ai',
  };

  return (
    <html lang="pt-BR">
      <body className="bg-white text-slate-950 antialiased">
        <SiteHeader />
        {children}
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        <StructuredData data={softwareSchema} />
      </body>
    </html>
  );
}
