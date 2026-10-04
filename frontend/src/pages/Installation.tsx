import { useState } from 'react';
import { PageHeader, SectionHeader } from '../components/layout/PageHeader';
import DocPage, { type TocItem } from '../components/layout/DocPage';
import TerminalBlock, { Dim } from '../components/code/TerminalBlock';
import Tabs from '../components/ui/Tabs';
import Callout from '../components/ui/Callout';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import styles from './Installation.module.css';

type Method = 'npm' | 'brew' | 'curl' | 'docker';

interface MethodDoc {
  label: string;
  install: string;
  version: string;
  help: string;
  run: string;
  upgrade: string;
  uninstall: string;
  note?: string;
}

// Package names and URLs are placeholders until Cloak is published.
const methods: Record<Method, MethodDoc> = {
  npm: {
    label: 'npm',
    install: 'npm install -g cloak',
    version: 'cloak --version',
    help: 'cloak --help',
    run: 'cat error.log | cloak',
    upgrade: 'npm update -g cloak',
    uninstall: 'npm uninstall -g cloak',
    note: 'Requires Node.js 18 or later.'
  },
  brew: {
    label: 'Homebrew',
    install: 'brew install cloak',
    version: 'cloak --version',
    help: 'cloak --help',
    run: 'cat error.log | cloak',
    upgrade: 'brew upgrade cloak',
    uninstall: 'brew uninstall cloak'
  },
  curl: {
    label: 'curl',
    install: 'curl -fsSL https://cloak.dev/install.sh | sh',
    version: 'cloak --version',
    help: 'cloak --help',
    run: 'cat error.log | cloak',
    upgrade: 'cloak self update',
    uninstall: 'rm "$(which cloak)"',
    note: 'Installs a single binary. No other runtime needed.'
  },
  docker: {
    label: 'Docker',
    install: 'docker pull cloak/cloak',
    version: 'docker run --rm cloak/cloak --version',
    help: 'docker run --rm cloak/cloak --help',
    run: 'docker run --rm -i cloak/cloak < error.log',
    upgrade: 'docker pull cloak/cloak',
    uninstall: 'docker rmi cloak/cloak',
    note: 'Pass input on stdin with -i. Nothing is written to the container.'
  }
};

const tabs = (Object.keys(methods) as Method[]).map((id) => ({ id, label: methods[id].label }));

const toc: TocItem[] = [
  { id: 'install', label: 'Install' },
  { id: 'verify', label: 'Verify' },
  { id: 'help', label: 'Get help' },
  { id: 'first-command', label: 'First command' },
  { id: 'commands', label: 'Commands' },
  { id: 'upgrade', label: 'Upgrade' },
  { id: 'uninstall', label: 'Uninstall' }
];

function loadMethod(): Method {
  try {
    const saved = localStorage.getItem('cloak:install-method');
    if (saved && saved in methods) return saved as Method;
  } catch {
    // storage unavailable: fall back to default
  }
  return 'npm';
}

export default function Installation() {
  useDocumentTitle('Installation');
  const [method, setMethod] = useState<Method>(loadMethod);
  const doc = methods[method];

  function choose(id: Method) {
    setMethod(id);
    try {
      localStorage.setItem('cloak:install-method', id);
    } catch {
      // ignore
    }
  }

  return (
    <DocPage
      toc={toc}
      prev={{ to: '/', label: 'Introduction' }}
      next={{ to: '/upload', label: 'Upload' }}
    >
      <PageHeader
        title="Installation"
        description="Install Cloak and start sanitizing sensitive debugging data locally."
      />

      <SectionHeader id="install">Install</SectionHeader>
      <p className={styles.prose}>Choose a method. Your choice applies to the rest of this page.</p>
      <div className={styles.gap}>
        <Tabs label="Installation method" tabs={tabs} value={method} onChange={choose}>
          <TerminalBlock command={doc.install} />
          {doc.note && <p className={styles.note}>{doc.note}</p>}
        </Tabs>
      </div>

      <SectionHeader id="verify">Verify</SectionHeader>
      <p className={styles.prose}>Check that Cloak is available:</p>
      <div className={styles.gap}>
        <TerminalBlock
          command={doc.version}
          output={<Dim>Cloak v0.1.0</Dim>}
        />
      </div>

      {method !== 'docker' && (
        <p className={`${styles.note} ${styles.gap}`}>
          You can also use <code>cloak -V</code>.
        </p>
      )}

      <SectionHeader id="help">Get help</SectionHeader>
      <p className={styles.prose}>Show the banner and the full list of commands:</p>
      <div className={styles.gap}>
        <TerminalBlock command={doc.help} />
      </div>

      <SectionHeader id="first-command">First command</SectionHeader>
      <p className={styles.prose}>
        Pipe any log into Cloak. It prints the sanitized text to stdout.
      </p>
      <div className={styles.gap}>
        <TerminalBlock command={doc.run} />
      </div>
      {method !== 'docker' && (
        <>
          <p className={`${styles.prose} ${styles.gapLarge}`}>
            Or sanitize whatever is on your clipboard. Copy an error, then run:
          </p>
          <div className={styles.gap}>
            <TerminalBlock command="cloak clip" />
          </div>
        </>
      )}
      <div className={styles.gapLarge}>
        <Callout>
          Your input is processed locally. Cloak does not need to upload your logs to sanitize them.
        </Callout>
      </div>

      <SectionHeader id="commands">Commands</SectionHeader>

      <h3 className={styles.sub}>Ask</h3>
      <p className={styles.prose}>
        Copy any error from your browser or terminal with Ctrl+C, then run:
      </p>
      <div className={styles.gap}>
        <TerminalBlock command="cloak ask" />
      </div>
      <p className={`${styles.prose} ${styles.gapLarge}`}>Or pass a custom question:</p>
      <div className={styles.gap}>
        <TerminalBlock command={'cloak ask "Explain why the database connection failed and provide the exact fix"'} />
      </div>

      <h3 className={styles.sub}>Sanitize clipboard</h3>
      <p className={styles.prose}>
        Reads whatever is on your clipboard, masks all secrets, and replaces the clipboard with safe text you can
        paste anywhere.
      </p>
      <div className={styles.gap}>
        <TerminalBlock command="cloak clip" />
      </div>
      <p className={`${styles.prose} ${styles.gapLarge}`}>Add <code>-v</code> for a breakdown by category:</p>
      <div className={styles.gap}>
        <TerminalBlock command="cloak clip -v" />
      </div>

      <h3 className={styles.sub}>Restore clipboard</h3>
      <p className={styles.prose}>
        After the AI generates code or commands using the placeholder tokens, copy its response and run restore to
        substitute your real values back:
      </p>
      <div className={styles.gap}>
        <TerminalBlock command="cloak restore" />
      </div>

      <h3 className={styles.sub}>Web app</h3>
      <p className={styles.prose}>Start the local companion web app:</p>
      <div className={styles.gap}>
        <TerminalBlock command="cloak ui" />
      </div>

      <SectionHeader id="upgrade">Upgrade</SectionHeader>
      <div className={styles.gap}>
        <TerminalBlock command={doc.upgrade} />
      </div>

      <SectionHeader id="uninstall">Uninstall</SectionHeader>
      <div className={styles.gap}>
        <TerminalBlock command={doc.uninstall} />
      </div>
    </DocPage>
  );
}
