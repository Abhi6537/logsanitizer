import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './DocPage.module.css';

export interface TocItem {
  id: string;
  label: string;
}

interface Neighbor {
  to: string;
  label: string;
}

interface Props {
  toc?: TocItem[];
  next?: Neighbor;
  prev?: Neighbor;
  children: React.ReactNode;
}

/** Doc-style page body: reading column, optional "On this page" rail, prev/next footer. */
export default function DocPage({ toc, next, prev, children }: Props) {
  const [active, setActive] = useState(toc?.[0]?.id ?? '');

  useEffect(() => {
    if (!toc?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px' }
    );
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  return (
    <div className={styles.layout}>
      <article className={styles.article}>
        {children}
        {(prev || next) && (
          <nav className={styles.pager} aria-label="Pagination">
            {prev ? (
              <Link to={prev.to} className={styles.pagerLink}>
                <span className={styles.pagerHint}>Previous</span>
                <span className={styles.pagerLabel}>← {prev.label}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={next.to} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                <span className={styles.pagerHint}>Next</span>
                <span className={styles.pagerLabel}>{next.label} →</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      {toc && toc.length > 0 && (
        <aside className={styles.toc} aria-label="On this page">
          <div className={styles.tocTitle}>On this page</div>
          <ul>
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className={`${styles.tocLink} ${active === item.id ? styles.tocActive : ''}`}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
