import { useState } from 'react';
import Button from '../ui/Button';
import { formatSize } from '../../lib/format';
import styles from './PasteInput.module.css';

interface Props {
  /** Called with the pasted text as a File so it flows through the normal upload pipeline. */
  onSubmit: (file: File) => void;
}

function pastedFileName(): string {
  const t = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `pasted-${pad(t.getHours())}${pad(t.getMinutes())}${pad(t.getSeconds())}.txt`;
}

export default function PasteInput({ onSubmit }: Props) {
  const [text, setText] = useState('');
  const empty = text.trim() === '';
  const size = new Blob([text]).size;

  function submit() {
    if (empty) return;
    onSubmit(new File([text], pastedFileName(), { type: 'text/plain' }));
    setText('');
  }

  return (
    <div>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Paste a log, stack trace, or API response..."
        aria-label="Text to redact"
        spellCheck={false}
        rows={10}
      />
      <div className={styles.footer}>
        <span className={styles.meta}>{empty ? 'Ctrl+Enter to redact' : `${formatSize(size)} · Ctrl+Enter to redact`}</span>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => setText('')} disabled={text === ''}>
            Clear
          </Button>
          <Button variant="primary" onClick={submit} disabled={empty}>
            Redact
          </Button>
        </div>
      </div>
    </div>
  );
}
