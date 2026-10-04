import type { UploadRecord } from '../../api/types';
import RedactionStatus from './RedactionStatus';
import styles from './RedactionSummary.module.css';

export default function RedactionSummary({ record }: { record: UploadRecord }) {
  const remaining = Math.max(record.findings - record.redactions, 0);

  return (
    <dl className={styles.summary}>
      <div className={styles.item}>
        <dd>{record.findings}</dd>
        <dt>Findings</dt>
      </div>
      <div className={styles.item}>
        <dd>{record.redactions}</dd>
        <dt>Redactions</dt>
      </div>
      <div className={styles.item}>
        <dd>{remaining}</dd>
        <dt>Remaining</dt>
      </div>
      <div className={styles.item}>
        <dd>
          <RedactionStatus status={record.status} labels={{ redacted: remaining === 0 ? 'Safe' : 'Review' }} />
        </dd>
        <dt>Status</dt>
      </div>
    </dl>
  );
}
