import { PageHeader } from '../components/layout/PageHeader';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function Placeholder({ title }: { title: string }) {
  useDocumentTitle(title);
  return (
    <div style={{ maxWidth: 'var(--content-width)' }}>
      <PageHeader title={title} description="This page is coming in a later step." />
    </div>
  );
}
