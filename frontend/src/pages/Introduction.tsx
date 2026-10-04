import { Link } from 'react-router-dom';
import { PageHeader, SectionHeader } from '../components/layout/PageHeader';
import DocPage, { type TocItem } from '../components/layout/DocPage';
import TerminalBlock, { Dim, Ok, Token } from '../components/code/TerminalBlock';
import Callout from '../components/ui/Callout';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import styles from './Introduction.module.css';

const toc: TocItem[] = [
  { id: 'why', label: 'Why Cloak' },
  { id: 'example', label: 'Example' },
  { id: 'detects', label: 'What Cloak detects' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'placeholders', label: 'Consistent placeholders' },
  { id: 'usage', label: 'Ways to use Cloak' },
  { id: 'principles', label: 'Principles' },
  { id: 'next', label: 'Next steps' }
];

const detects = [
  { name: 'API keys and tokens', examples: 'AWS access keys, GitHub tokens, Stripe keys, JWTs' },
  { name: 'Passwords and connection strings', examples: 'postgres://user:password@host/db' },
  { name: 'Email addresses', examples: 'name@company.com' },
  { name: 'IP addresses', examples: '192.168.1.24' },
  { name: 'Internal URLs and hostnames', examples: 'prod-db-07.internal.company.com' },
  { name: 'File paths', examples: '/home/name/projects/payment-service/' },
  { name: 'Private keys', examples: 'PEM-encoded key blocks' },
  { name: 'Identifiers', examples: 'UUIDs and other infrastructure IDs' }
];

const steps = [
  {
    title: 'Input',
    body: 'You give Cloak a log, stack trace, API response or screenshot. Pipe it from the terminal, copy it from the clipboard, or upload it in the web interface.'
  },
  {
    title: 'Cloak',
    body: 'Cloak scans the input on your machine, matches sensitive values against its detection rules, and replaces each one with a placeholder. Nothing is sent over the network.'
  },
  {
    title: 'Safe output',
    body: 'You get the same text with every sensitive value replaced. The structure, error messages and line numbers stay intact, so the AI can still reason about the problem.'
  }
];

const usage = [
  {
    name: 'Pipe',
    body: 'Send any command output or file through Cloak from the terminal.',
    commands: ['cat error.log | cloak']
  },
  {
    name: 'Clipboard',
    body: 'Sanitize what you just copied, then paste it into your AI tool. Add -v for a breakdown by category.',
    commands: ['cloak clip', 'cloak clip -v']
  },
  {
    name: 'Restore',
    body: 'After the AI answers using the placeholders, copy its response and restore your real values.',
    commands: ['cloak restore']
  },
  {
    name: 'Ask',
    body: 'Sanitize the error on your clipboard, ask the AI, and get the answer back with real values restored. Pass a question to focus it.',
    commands: ['cloak ask', 'cloak ask "Explain why the database connection failed and provide the exact fix"']
  },
  {
    name: 'Web app',
    body: 'Start the local companion web app to redact files and review what changed.',
    commands: ['cloak ui']
  }
];

const principles = [
  { name: 'Local-first', body: 'Processing happens on your machine. Your input is not uploaded.' },
  { name: 'Zero-leak', body: 'Sensitive data is removed before any AI sees it.' },
  { name: 'Developer-first', body: 'Built to work from the terminal, in the tools you already use.' },
  { name: 'AI-compatible', body: 'Output works with modern AI coding and debugging workflows.' }
];

export default function Introduction() {
  useDocumentTitle('Introduction');

  return (
    <DocPage toc={toc} next={{ to: '/installation', label: 'Installation' }}>
      <PageHeader
        title="Introduction"
        description="A local-first terminal piping engine for safely debugging with AI."
      />

      <SectionHeader id="why">Why Cloak</SectionHeader>
      <p className={styles.prose}>
        When something breaks in production, the fastest way to get help is often to paste the error into an AI tool.
        But production logs, stack traces, screenshots and API responses regularly contain API keys, database
        credentials, customer email addresses, internal hostnames and file paths.
      </p>
      <p className={styles.prose}>
        Cloak sits between your terminal and the AI. It detects sensitive information and redacts it locally, before
        anything is shared. You keep the context the AI needs and leave the secrets behind.
      </p>

      <SectionHeader id="example">Example</SectionHeader>
      <p className={styles.prose}>Pipe a log into Cloak. The sanitized text is printed to your terminal.</p>
      <div className={styles.gap}>
        <TerminalBlock
          command="cat error.log | cloak"
          output={
            <>
              Error: connection to database failed{'\n'}
              {'  '}host:   <Token>[HOSTNAME_1]</Token>
              {'\n'}
              {'  '}user:   <Token>[EMAIL_1]</Token>
              {'\n'}
              {'  '}key:    <Token>[API_KEY_1]</Token>
              {'\n'}
              {'  '}client: <Token>[IP_ADDRESS_1]</Token>
              {'\n'}
              {'  '}cwd:    <Token>[FILE_PATH_1]</Token>
              {'\n\n'}
              <Ok>✓ 5 sensitive items redacted</Ok> <Dim>· processed locally</Dim>
            </>
          }
        />
      </div>
      <p className={`${styles.prose} ${styles.gap}`}>
        The error message and structure are untouched. Only the sensitive values are replaced.
      </p>

      <SectionHeader id="detects">What Cloak detects</SectionHeader>
      <p className={styles.prose}>Cloak looks for these kinds of sensitive information:</p>
      <dl className={`${styles.principles} ${styles.gap}`}>
        {detects.map((d) => (
          <div key={d.name} className={styles.principle}>
            <dt>{d.name}</dt>
            <dd>{d.examples}</dd>
          </div>
        ))}
      </dl>

      <SectionHeader id="how-it-works">How it works</SectionHeader>
      <ol className={styles.steps}>
        {steps.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber}>{i + 1}</span>
            <div>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepBody}>{step.body}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.gapLarge}>
        <Callout title="Your input stays on your machine">
          Cloak does not need to upload your logs to sanitize them.
        </Callout>
      </div>

      <SectionHeader id="placeholders">Consistent placeholders</SectionHeader>
      <p className={styles.prose}>
        The same value always gets the same placeholder within a session. If an email address appears ten times, it
        becomes <code>[EMAIL_1]</code> all ten times, so the AI can still follow how values relate to each other.
      </p>
      <p className={styles.prose}>
        Cloak remembers the mapping locally. When the AI answers with a fix that uses a placeholder, you can restore
        the real value before you apply it.
      </p>

      <SectionHeader id="usage">Ways to use Cloak</SectionHeader>
      <dl className={styles.principles}>
        {usage.map((u) => (
          <div key={u.name} className={styles.principle}>
            <dt>{u.name}</dt>
            <dd>
              {u.body}
              <span className={styles.commands}>
                {u.commands.map((c) => (
                  <code key={c}>{c}</code>
                ))}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <SectionHeader id="principles">Principles</SectionHeader>
      <dl className={styles.principles}>
        {principles.map((p) => (
          <div key={p.name} className={styles.principle}>
            <dt>{p.name}</dt>
            <dd>{p.body}</dd>
          </div>
        ))}
      </dl>

      <SectionHeader id="next">Next steps</SectionHeader>
      <ul className={styles.next}>
        <li>
          <Link to="/installation">Installation</Link>: install Cloak and run your first command.
        </li>
        <li>
          <Link to="/upload">Upload</Link>: redact a file in the web interface.
        </li>
        <li>
          <Link to="/redaction">Redaction</Link>: review what Cloak found and removed.
        </li>
      </ul>
    </DocPage>
  );
}
