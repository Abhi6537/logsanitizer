import { useState } from 'react';
import { restoreResponse } from '../../api/mock';
import type { RestoreResult } from '../../api/types';
import Button from '../ui/Button';
import CopyButton from '../code/CopyButton';
import styles from './RestorePanel.module.css';

export default function RestorePanel({ redactionId }: { redactionId: string }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<RestoreResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const empty = text.trim() === '';

  async function restore() {
    if (empty || busy) return;
    setBusy(true);
    setError(false);
    try {
      setResult(await restoreResponse(redactionId, text));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setText('');
    setResult(null);
    setError(false);
  }

  const restoredText = result?.segments.map((s) => s.text).join('') ?? '';

  return (
    <div>
      <p className={styles.intro}>
        Paste the AI's answer. Cloak swaps this file's placeholders, such as <code>[EMAIL_1]</code>, back to the
        real values so you can apply the fix.
      </p>

      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void restore();
          }
        }}
        placeholder="Paste the AI response here..."
        aria-label="AI response to restore"
        spellCheck={false}
        rows={6}
      />

      <div className={styles.actions}>
        <span className={styles.hint}>Ctrl+Enter to restore</span>
        <div className={styles.buttons}>
          <Button variant="ghost" onClick={clear} disabled={text === '' && !result}>
            Clear
          </Button>
          <Button variant="primary" onClick={() => void restore()} disabled={empty || busy}>
            {busy ? 'Restoring...' : 'Restore'}
          </Button>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          Couldn't restore this response. Try again.
        </p>
      )}

      {result && (
        <div className={styles.result} aria-live="polite">
          <div className={styles.resultHeader}>
            <span>
              {result.restored === 0
                ? 'No placeholders from this redaction were found.'
                : `${result.restored} ${result.restored === 1 ? 'placeholder' : 'placeholders'} restored`}
            </span>
            <CopyButton text={restoredText} />
          </div>
          <pre className={styles.output}>
            {result.segments.map((s, i) =>
              s.kind === 'text' ? (
                <span key={i}>{s.text}</span>
              ) : (
                <mark key={i} className={s.kind === 'restored' ? styles.restored : styles.unknown}>
                  {s.text}
                </mark>
              )
            )}
          </pre>
          {result.unknown > 0 && (
            <p className={styles.note}>
              {result.unknown} {result.unknown === 1 ? 'placeholder was' : 'placeholders were'} not recognised and left
              as-is.
            </p>
          )}
          <p className={styles.note}>This output contains real values. It stays on this page.</p>
        </div>
      )}
    </div>
  );
}
