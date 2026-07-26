import type { MetadataRoute } from 'next';

import { getSiteUrl } from '../lib/seo';

/** Transactional / private paths — keep out of search & AI indexes. */
const DISALLOW = ['/checkout', '/flights/search', '/flights/offers', '/brand'];

/** Named AI / assistant crawlers — explicit allow so operators don’t assume a blanket block. */
const AI_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'GoogleOther',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'meta-externalagent',
  'FacebookBot',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: AI_USER_AGENTS,
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ''),
  };
}
