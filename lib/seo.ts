import type { Metadata } from 'next';

export const siteConfig = {
  name: 'ATLAZ',
  title: 'ATLAZ',
  defaultTitle: 'ATLAZ | Cognitive Investigation Platform',
  description:
    'ATLAZ é uma plataforma de investigação cognitiva para transformar problemas complexos em hipóteses, evidências e decisões rastreáveis.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://atlaz.ai',
  author: 'ATLAZ',
  keywords: [
    'ATLAZ',
    'investigação cognitiva',
    'inteligência para decisões',
    'runtime de investigação',
    'SEO técnico',
    'gestão de evidências',
  ],
  image: '/og-image.svg',
};

export function buildPageMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
  type = 'website',
  image = siteConfig.image,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  image?: string;
}): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = new URL(normalizedPath, siteConfig.url).toString();

  return {
    metadataBase: new URL(siteConfig.url),
    title: title ? `${title} | ${siteConfig.name}` : siteConfig.defaultTitle,
    description: description ?? siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    applicationName: siteConfig.name,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    openGraph: {
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.defaultTitle,
      description: description ?? siteConfig.description,
      url: canonicalUrl,
      type,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.defaultTitle,
      description: description ?? siteConfig.description,
      images: [image],
    },
  };
}
