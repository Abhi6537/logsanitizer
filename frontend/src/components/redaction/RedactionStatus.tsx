import type { RecordStatus } from '../../api/types';
import styles from './RedactionStatus.module.css';

const defaultLabels: Record<RecordStatus, string> = {
  redacted: 'Redacted',
  processing: 'Processing',
  failed: 'Failed'
};

interface Props {
  status: RecordStatus;
  /** Override the visible text, e.g. { redacted: 'Safe' }. */
  labels?: Partial<Record<RecordStatus, string>>;
}

export default function RedactionStatus({ status, labels }: Props) {
  const text = labels?.[status] ?? defaultLabels[status];
  return <span className={`${styles.badge} ${styles[status]}`}>{text}</span>;
}
