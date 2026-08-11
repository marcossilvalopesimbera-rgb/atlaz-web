import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atlaz.ai';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/', '/_next/', '/private/', '/workspace/**'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
