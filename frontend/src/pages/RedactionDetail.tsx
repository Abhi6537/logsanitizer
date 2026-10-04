import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SectionHeader } from '../components/layout/PageHeader';
import RedactionSummary from '../components/redaction/RedactionSummary';
import BeforeAfterViewer from '../components/redaction/BeforeAfterViewer';
import ImagePreview from '../components/redaction/ImagePreview';
import FindingsTable from '../components/redaction/FindingsTable';
import FindingBadge from '../components/redaction/FindingBadge';
import RestorePanel from '../components/redaction/RestorePanel';
import EmptyState from '../components/ui/EmptyState';
import Callout from '../components/ui/Callout';
import Button from '../components/ui/Button';
import { DownloadIcon } from '../components/layout/Icons';
import { getRedaction, NotFoundError } from '../api/mock';
import type { Finding, FindingCategory, RedactionDetail as Detail } from '../api/types';
import { formatDateTime } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import styles from './RedactionDetail.module.css';

type LoadState = 'loading' | 'loaded' | 'notfound' | 'error';

export default function RedactionDetail() {
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [category, setCategory] = useState<FindingCategory | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number>();

  useDocumentTitle(detail?.record.name ?? 'Redaction');

  const load = useCallback(() => {
    setState('loading');
    getRedaction(id)
      .then((d) => {
        setDetail(d);
        setState('loaded');
      })
      .catch((err) => setState(err instanceof NotFoundError ? 'notfound' : 'error'));
  }, [id]);

  useEffect(load, [load]);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const findingMap = useMemo(() => new Map<string, Finding>((detail?.findings ?? []).map((f) => [f.id, f])), [detail]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<FindingCategory, number>();
    detail?.findings.forEach((f) => counts.set(f.category, (counts.get(f.category) ?? 0) + 1));
    return Array.from(counts.entries());
  }, [detail]);

  function focusFinding(findingId: string) {
    setFlashId(findingId);
    document.getElementById(`seg-${findingId}-original`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 1300);
  }

  function download() {
    if (!detail) return;
    const text = detail.lines.map((l) => l.sanitized.map((s) => s.text).join('')).join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanitized-${detail.record.name}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const back = (
    <Link to="/redaction" className={styles.back}>
      ← Back to Redaction
    </Link>
  );

  if (state === 'loading') {
    return (
      <div className={styles.page} aria-busy="true">
        {back}
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeleton} ${styles.skeletonSummary}`} />
        <div className={`${styles.skeleton} ${styles.skeletonViewer}`} />
      </div>
    );
  }

  if (state === 'notfound' || state === 'error' || !detail) {
    return (
      <div className={styles.page}>
        {back}
        <EmptyState title={state === 'notfound' ? 'Redaction not found' : "Couldn't load this redaction"}>
          {state === 'notfound' ? (
            <Link to="/redaction">View all redactions</Link>
          ) : (
            <Button onClick={load}>Retry</Button>
          )}
        </EmptyState>
      </div>
    );
  }

  const { record, lines, findings } = detail;
  const isImage = record.kind === 'Image';
  const activeId = hoveredId ?? flashId;

  return (
    <div className={styles.page}>
      {back}

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{record.name}</h1>
          <p className={styles.meta}>Processed {formatDateTime(record.createdAt)}</p>
        </div>
        <Button
          onClick={download}
          disabled={isImage}
          title={isImage ? 'Image download is available once image redaction is connected' : undefined}
        >
          <DownloadIcon />
          Download sanitized file
        </Button>
      </header>

      {record.status === 'processing' && (
        <div className={styles.banner}>
          <Callout>This file is still being processed. Results may be incomplete.</Callout>
        </div>
      )}
      {record.status === 'failed' && (
        <div className={styles.banner}>
          <Callout title="Processing failed">Cloak could not finish redacting this file.</Callout>
        </div>
      )}

      <RedactionSummary record={record} />

      <SectionHeader>{isImage ? 'Screenshot' : 'Before and after'}</SectionHeader>

      {findings.length === 0 ? (
        <EmptyState title="No sensitive information found">The file was left unchanged.</EmptyState>
      ) : (
        <>
          {!isImage && (
            <div className={styles.filters} role="group" aria-label="Filter highlights by type">
              {categoryCounts.map(([cat, count]) => (
                <FindingBadge
                  key={cat}
                  category={cat}
                  count={count}
                  pressed={category === cat}
                  onClick={() => setCategory(category === cat ? null : cat)}
                />
              ))}
            </div>
          )}

          {isImage ? (
            <ImagePreview lines={lines} findings={findingMap} />
          ) : (
            <BeforeAfterViewer
              lines={lines}
              findings={findingMap}
              category={category}
              hoveredId={hoveredId}
              flashId={flashId}
              onHover={setHoveredId}
            />
          )}

          <SectionHeader>Findings</SectionHeader>
          <FindingsTable findings={findings} onSelect={focusFinding} onHover={setHoveredId} activeId={activeId} />

          {!isImage && (
            <>
              <SectionHeader>Restore AI response</SectionHeader>
              <RestorePanel redactionId={record.id} />
            </>
          )}
        </>
      )}
    </div>
  );
}
