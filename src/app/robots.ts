import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kicktvstreams.my.id';

  return {
    rules: [
      {
        userAgent: ['*', 'Googlebot', 'Yandex', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'ia_archiver', 'facebot', 'twitterbot', 'AhrefsBot'],
        allow: '/',
        disallow: ['/admin', '/api/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
