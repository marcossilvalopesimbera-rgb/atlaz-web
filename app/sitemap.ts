import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlaz.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/compreender',
    '/context',
    '/decidir',
    '/evoluir',
    '/lab/problem-interpreter',
    '/new',
    '/workspace',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
