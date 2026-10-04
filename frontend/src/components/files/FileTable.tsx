import { Link } from 'react-router-dom';
import type { UploadRecord } from '../../api/types';
import { formatDate, formatSize } from '../../lib/format';
import RedactionStatus from '../redaction/RedactionStatus';
import FileTypeIcon from './FileTypeIcon';
import styles from './FileTable.module.css';

export default function FileTable({ records }: { records: UploadRecord[] }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th className={styles.num}>Size</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>
                <Link to={`/redaction/${r.id}`} className={styles.name}>
                  <FileTypeIcon kind={r.kind} />
                  {r.name}
                </Link>
              </td>
              <td className={styles.secondary}>{r.kind}</td>
              <td className={`${styles.num} ${styles.secondary}`}>{formatSize(r.size)}</td>
              <td>
                <RedactionStatus status={r.status} />
              </td>
              <td className={styles.secondary}>{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
