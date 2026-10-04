import { useState } from 'react';
import type { Finding } from '../../api/types';
import { CATEGORIES } from '../../lib/categories';
import FindingBadge from './FindingBadge';
import fileStyles from '../files/FileTable.module.css';
import styles from './FindingsTable.module.css';

const DOTS = '••••••••';

/** Hide the secret, keeping just enough of a prefix to recognise it (e.g. "sk_l••••••••"). */
function mask(value: string): string {
  if (value.length <= 8) return DOTS;
  return `${value.slice(0, 4)}${DOTS}`;
}

interface Props {
  findings: Finding[];
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  activeId: string | null;
}

export default function FindingsTable({ findings, onSelect, onHover, activeId }: Props) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const allRevealed = revealed.size === findings.length;

  function toggle(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setRevealed(allRevealed ? new Set() : new Set(findings.map((f) => f.id)));
  }

  return (
    <div className={fileStyles.wrap}>
      <table className={fileStyles.table}>
        <thead>
          <tr>
            <th>Type</th>
            <th>
              Original
              <button type="button" className={styles.reveal} onClick={toggleAll}>
                {allRevealed ? 'Hide all' : 'Show all'}
              </button>
            </th>
            <th>Replacement</th>
            <th className={fileStyles.num}>Line</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f) => {
            const isRevealed = revealed.has(f.id);
            return (
              <tr
                key={f.id}
                className={`${styles.row} ${activeId === f.id ? styles.active : ''}`}
                tabIndex={0}
                onClick={() => onSelect(f.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelect(f.id);
                }}
                onMouseEnter={() => onHover(f.id)}
                onMouseLeave={() => onHover(null)}
              >
                <td>
                  <FindingBadge category={f.category} />
                </td>
                <td>
                  <span className={styles.mono}>{isRevealed ? f.original : mask(f.original)}</span>
                  <button
                    type="button"
                    className={styles.reveal}
                    aria-label={`${isRevealed ? 'Hide' : 'Show'} original ${CATEGORIES[f.category].label} value`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(f.id);
                    }}
                  >
                    {isRevealed ? 'Hide' : 'Show'}
                  </button>
                </td>
                <td>
                  <span className={styles.mono}>{f.replacement}</span>
                </td>
                <td className={`${fileStyles.num} ${fileStyles.secondary}`}>{f.line}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
