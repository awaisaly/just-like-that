import type { MetadataRoute } from 'next';
import { seoPages, seoPath } from '../data/seo-pages';
import { getSiteUrl } from '../lib/seo';

function pagePriority(page: (typeof seoPages)[number]): number {
  if (page.type === 'guide') {
    if (page.slug === 'cheap-flights-to-africa' || page.slug === 'flights-uk-nigeria') return 0.95;
    return 0.85;
  }
  if (page.type === 'route') {
    if (
      page.slug.includes('lagos') ||
      page.slug.includes('abuja') ||
      page.slug.includes('accra') ||
      page.slug.includes('nigeria')
    ) {
      return 0.92;
    }
    return 0.85;
  }
  if (page.type === 'destination') {
    if (
      ['lagos', 'abuja', 'port-harcourt', 'accra', 'nairobi', 'johannesburg', 'london', 'manchester'].includes(
        page.slug,
      )
    ) {
      return 0.88;
    }
    return 0.75;
  }
  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${base}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    ...seoPages.map((page) => ({
      url: `${base}${seoPath(page)}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: pagePriority(page),
    })),
  ];
}
