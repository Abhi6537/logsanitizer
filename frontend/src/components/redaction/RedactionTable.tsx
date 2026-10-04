import { useNavigate } from 'react-router-dom';
import type { UploadRecord } from '../../api/types';
import { formatDate } from '../../lib/format';
import FileTypeIcon from '../files/FileTypeIcon';
import RedactionStatus from './RedactionStatus';
import styles from '../files/FileTable.module.css';
import local from './RedactionTable.module.css';

export function RedactionTableSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={local.skeleton} />
      ))}
    </div>
  );
}

export default function RedactionTable({ records }: { records: UploadRecord[] }) {
  const navigate = useNavigate();

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th className={styles.num}>Findings</th>
            <th className={styles.num}>Redactions</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const open = () => navigate(`/redaction/${r.id}`);
            return (
              <tr
                key={r.id}
                className={local.row}
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') open();
                }}
              >
                <td>
                  <span className={styles.name}>
                    <FileTypeIcon kind={r.kind} />
                    {r.name}
                  </span>
                </td>
                <td className={styles.secondary}>{r.kind}</td>
                <td className={styles.num}>{r.findings}</td>
                <td className={styles.num}>{r.redactions}</td>
                <td className={styles.secondary}>{formatDate(r.createdAt)}</td>
                <td>
                  <RedactionStatus status={r.status} labels={{ redacted: 'Safe' }} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
