import type { FindingCategory } from '../../api/types';
import { CATEGORIES } from '../../lib/categories';
import styles from './FindingBadge.module.css';

interface Props {
  category: FindingCategory;
  count?: number;
  /** When provided the badge is a toggle button (used to filter the viewer). */
  pressed?: boolean;
  onClick?: () => void;
}

export default function FindingBadge({ category, count, pressed, onClick }: Props) {
  const info = CATEGORIES[category];
  const content = (
    <>
      <span className={styles.dot} style={{ background: info.dot }} aria-hidden />
      {info.label}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </>
  );

  if (!onClick) return <span className={styles.badge}>{content}</span>;

  return (
    <button
      type="button"
      className={`${styles.badge} ${styles.button} ${pressed ? styles.pressed : ''}`}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
