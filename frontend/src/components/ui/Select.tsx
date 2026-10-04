import styles from './Input.module.css';

export default function Select({ className = '', children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${styles.input} ${styles.select} ${className}`} {...rest}>
      {children}
    </select>
  );
}
