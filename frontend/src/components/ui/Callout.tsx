import styles from './Callout.module.css';

export default function Callout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className={styles.callout} role="note">
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
