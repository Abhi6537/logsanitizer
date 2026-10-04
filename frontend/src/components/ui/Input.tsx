import styles from './Input.module.css';

export default function Input({ className = '', ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${styles.input} ${className}`} {...rest} />;
}
