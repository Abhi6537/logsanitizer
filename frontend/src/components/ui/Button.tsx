import styles from './Button.module.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function Button({ variant = 'secondary', className = '', ...rest }: Props) {
  return <button type="button" className={`${styles.button} ${styles[variant]} ${className}`} {...rest} />;
}
