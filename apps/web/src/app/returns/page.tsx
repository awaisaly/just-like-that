import { LegalDocument } from '../../components/LegalDocument';
import { getLegalPage } from '../../lib/legal';
import { buildPageMetadata } from '../../lib/seo';

const page = getLegalPage('returns');

export const metadata = buildPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  ogTitle: `${page.title} | Elca Airbridge`,
  keywords: ['return policy', 'flight refunds', 'cancellation policy', 'Elca Airbridge'],
});

export default function ReturnsPage() {
  return <LegalDocument page={page} />;
}
