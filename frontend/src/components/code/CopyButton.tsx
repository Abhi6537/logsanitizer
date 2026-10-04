import { useState } from 'react';
import { CheckIcon, CopyIcon } from '../layout/Icons';
import styles from './Code.module.css';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className={styles.copy} onClick={copy} aria-label={copied ? 'Copied' : 'Copy to clipboard'}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
