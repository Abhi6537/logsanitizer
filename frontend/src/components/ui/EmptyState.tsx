import styles from './EmptyState.module.css';

export default function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className={styles.empty}>
      <div className={styles.title}>{title}</div>
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
