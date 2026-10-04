import { Link } from 'react-router-dom';
import type { UploadRecord } from '../../api/types';
import Button from '../ui/Button';
import styles from './UploadProgress.module.css';

export type JobPhase = 'uploading' | 'processing' | 'complete' | 'error';

export interface UploadJob {
  key: string;
  name: string;
  phase: JobPhase;
  progress: number;
  record?: UploadRecord;
  error?: string;
}

interface Props {
  job: UploadJob;
  onCancel: (key: string) => void;
  onRetry: (key: string) => void;
  onDismiss: (key: string) => void;
}

export default function UploadProgress({ job, onCancel, onRetry, onDismiss }: Props) {
  return (
    <div className={styles.job} role="status">
      <div className={styles.head}>
        <span className={styles.name}>{job.name}</span>
        {job.phase === 'uploading' && (
          <Button variant="ghost" onClick={() => onCancel(job.key)}>
            Cancel
          </Button>
        )}
        {(job.phase === 'complete' || job.phase === 'error') && (
          <Button variant="ghost" onClick={() => onDismiss(job.key)} aria-label={`Dismiss ${job.name}`}>
            Dismiss
          </Button>
        )}
      </div>

      {job.phase === 'uploading' && (
        <>
          <div className={styles.label}>Uploading...</div>
          <div
            className={styles.track}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={job.progress}
          >
            <div className={styles.bar} style={{ width: `${job.progress}%` }} />
          </div>
        </>
      )}

      {job.phase === 'processing' && (
        <div className={styles.label}>
          <span className={styles.spinner} aria-hidden /> Scanning for sensitive information...
        </div>
      )}

      {job.phase === 'complete' && job.record && (
        <div className={styles.result}>
          <div className={styles.success}>Redaction complete</div>
          <div className={styles.counts}>
            {job.record.findings} sensitive items detected
            <br />
            {job.record.redactions} items redacted
          </div>
          <Link to={`/redaction/${job.record.id}`}>View redaction →</Link>
        </div>
      )}

      {job.phase === 'error' && (
        <div className={styles.result}>
          <div className={styles.errorText}>{job.error ?? 'Something went wrong.'}</div>
          <div>
            <Button onClick={() => onRetry(job.key)}>Retry</Button>
          </div>
        </div>
      )}
    </div>
  );
}
