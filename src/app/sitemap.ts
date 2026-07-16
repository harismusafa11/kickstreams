import { MetadataRoute } from 'next';
import { fetchAllMatches } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const matches = await fetchAllMatches();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kicktvstreams.my.id';

  const matchUrls: MetadataRoute.Sitemap = matches.map((match) => ({
    url: `${baseUrl}/watch/${match.stream_key}`,
    lastModified: new Date(),
    changeFrequency: 'always',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    ...matchUrls,
  ];
}
