import CopyButton from './CopyButton';
import styles from './Code.module.css';

interface Props {
  command: string;
  prompt?: boolean;
  /** Optional command output shown beneath the command (use <Token> to mark redactions). */
  output?: React.ReactNode;
}

export default function TerminalBlock({ command, prompt = true, output }: Props) {
  return (
    <div className={styles.terminal}>
      <div className={styles.block}>
        <pre className={styles.pre}>
          <code className={styles.code}>
            {prompt && <span className={styles.prompt}>$ </span>}
            {command}
          </code>
        </pre>
        <CopyButton text={command} />
      </div>
      {output && (
        <pre className={styles.output}>
          <code className={styles.code}>{output}</code>
        </pre>
      )}
    </div>
  );
}

/** Highlights a redaction placeholder inside terminal output. */
export function Token({ children }: { children: React.ReactNode }) {
  return <mark className={styles.token}>{children}</mark>;
}

export function Dim({ children }: { children: React.ReactNode }) {
  return <span className={styles.dim}>{children}</span>;
}

export function Ok({ children }: { children: React.ReactNode }) {
  return <span className={styles.ok}>{children}</span>;
}
