import { LegalDocument } from '../../components/LegalDocument';
import { getLegalPage } from '../../lib/legal';
import { buildPageMetadata } from '../../lib/seo';

const page = getLegalPage('terms');

export const metadata = buildPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  ogTitle: `${page.title} | Elca Airbridge`,
  keywords: ['terms of service', 'booking terms', 'Elca Airbridge'],
});

export default function TermsPage() {
  return <LegalDocument page={page} />;
}
