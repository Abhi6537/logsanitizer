import styles from './PageHeader.module.css';

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </header>
  );
}

export function SectionHeader({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className={styles.section}>
      {children}
      {id && (
        <a href={`#${id}`} className={styles.anchor} aria-label="Link to this section">
          #
        </a>
      )}
    </h2>
  );
}
