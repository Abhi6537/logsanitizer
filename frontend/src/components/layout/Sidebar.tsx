import { NavLink, useLocation } from 'react-router-dom';
import { DownloadIcon, HomeIcon, LogoMark, ShieldIcon, UploadIcon } from './Icons';
import styles from './Sidebar.module.css';

const items = [
  { to: '/', label: 'Introduction', icon: <HomeIcon />, match: (p: string) => p === '/' },
  { to: '/installation', label: 'Installation', icon: <DownloadIcon />, match: (p: string) => p.startsWith('/installation') },
  { to: '/upload', label: 'Upload', icon: <UploadIcon />, match: (p: string) => p.startsWith('/upload') },
  { to: '/redaction', label: 'Redaction', icon: <ShieldIcon />, match: (p: string) => p.startsWith('/redaction') }
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <nav className={styles.sidebar} aria-label="Primary">
      <div className={styles.brand}>
        <LogoMark />
        <span className={styles.wordmark}>Cloak</span>
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`${styles.item} ${active ? styles.active : ''}`}
              >
                {item.icon}
                <span className={styles.label}>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
