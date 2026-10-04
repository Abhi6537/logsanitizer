import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import RedactionTable, { RedactionTableSkeleton } from '../components/redaction/RedactionTable';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { listRedactions } from '../api/mock';
import type { FileKind, UploadRecord } from '../api/types';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import styles from './Redaction.module.css';

type TypeFilter = 'all' | FileKind;

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'Log', label: 'Logs' },
  { value: 'Text', label: 'Text' },
  { value: 'JSON', label: 'JSON' },
  { value: 'YAML', label: 'YAML' },
  { value: 'Image', label: 'Images' }
];

export default function Redaction() {
  useDocumentTitle('Redaction');

  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listRedactions()
      .then(setRecords)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(
      (r) => (type === 'all' || r.kind === type) && (q === '' || r.name.toLowerCase().includes(q))
    );
  }, [records, query, type]);

  const filtering = query.trim() !== '' || type !== 'all';

  function clearFilters() {
    setQuery('');
    setType('all');
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Redaction"
        description="View previously processed files and detected sensitive information."
      />

      {!loading && !error && records.length > 0 && (
        <div className={styles.toolbar}>
          <Input
            type="search"
            className={styles.search}
            placeholder="Search files..."
            aria-label="Search files"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value as TypeFilter)}>
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {loading && <RedactionTableSkeleton />}

      {!loading && error && (
        <EmptyState title="Couldn't load redactions">
          <Button onClick={load}>Retry</Button>
        </EmptyState>
      )}

      {!loading && !error && records.length === 0 && (
        <EmptyState title="No redactions yet.">
          <Link to="/upload">Upload a file</Link> to start your first redaction.
        </EmptyState>
      )}

      {!loading && !error && records.length > 0 && filtered.length === 0 && (
        <EmptyState title={query.trim() ? `No results for "${query.trim()}"` : 'No files match this filter'}>
          {filtering && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </EmptyState>
      )}

      {!loading && !error && filtered.length > 0 && <RedactionTable records={filtered} />}
    </div>
  );
}
