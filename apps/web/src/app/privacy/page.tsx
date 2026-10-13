import { LegalDocument } from '../../components/LegalDocument';
import { getLegalPage } from '../../lib/legal';
import { buildPageMetadata } from '../../lib/seo';

const page = getLegalPage('privacy');

export const metadata = buildPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  ogTitle: `${page.title} | Elca Airbridge`,
  keywords: ['privacy policy', 'UK GDPR', 'Elca Airbridge'],
});

export default function PrivacyPage() {
  return <LegalDocument page={page} />;
}
