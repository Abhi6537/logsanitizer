import type { Finding, FindingCategory, Line, Segment } from '../../api/types';
import { CATEGORIES } from '../../lib/categories';
import { useMediaQuery } from '../../lib/useMediaQuery';
import CopyButton from '../code/CopyButton';
import styles from './BeforeAfterViewer.module.css';

type Side = 'original' | 'sanitized';

export interface HighlightState {
  /** Only highlight findings of this category; others are dimmed. */
  category: FindingCategory | null;
  hoveredId: string | null;
  flashId: string | null;
}

interface Props extends HighlightState {
  lines: Line[];
  findings: Map<string, Finding>;
  onHover: (id: string | null) => void;
}

function Segments({
  segments,
  side,
  findings,
  state,
  onHover
}: {
  segments: Segment[];
  side: Side;
  findings: Map<string, Finding>;
  state: HighlightState;
  onHover: (id: string | null) => void;
}) {
  if (segments.every((s) => s.text === '')) return <>{' '}</>;

  return (
    <>
      {segments.map((seg, i) => {
        const finding = seg.findingId ? findings.get(seg.findingId) : undefined;
        if (!finding) return <span key={i}>{seg.text}</span>;

        const dimmed = state.category !== null && finding.category !== state.category;
        const cls = [
          styles.mark,
          side === 'original' ? styles.orig : styles.san,
          dimmed ? styles.dim : '',
          state.hoveredId === finding.id ? styles.linked : '',
          state.flashId === finding.id ? styles.flash : ''
        ].join(' ');

        return (
          <mark
            key={i}
            id={`seg-${finding.id}-${side}`}
            className={cls}
            title={`${CATEGORIES[finding.category].label}: ${finding.replacement}`}
            onMouseEnter={() => onHover(finding.id)}
            onMouseLeave={() => onHover(null)}
          >
            {seg.text}
          </mark>
        );
      })}
    </>
  );
}

function Pane({ title, side, lines, findings, state, onHover, action }: Props & { title: string; side: Side; state: HighlightState; action?: React.ReactNode }) {
  return (
    <section className={styles.pane} aria-label={title}>
      <header className={styles.paneHeader}>
        <span>{title}</span>
        {action}
      </header>
      <div className={styles.paneBody}>
        {lines.map((line) => (
          <div key={line.n} className={styles.line}>
            <span className={styles.ln}>{line.n}</span>
            <span className={styles.text}>
              <Segments segments={line[side]} side={side} findings={findings} state={state} onHover={onHover} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BeforeAfterViewer(props: Props) {
  const { lines, findings, onHover, category, hoveredId, flashId } = props;
  const stacked = useMediaQuery('(max-width: 899px)');
  const state: HighlightState = { category, hoveredId, flashId };
  const sanitizedText = lines.map((l) => l.sanitized.map((s) => s.text).join('')).join('\n');

  const copy = <CopyButton text={sanitizedText} />;

  if (stacked) {
    return (
      <div className={styles.stacked}>
        <Pane {...props} title="Original" side="original" state={state} />
        <Pane {...props} title="Sanitized" side="sanitized" state={state} action={copy} />
      </div>
    );
  }

  // Wide: one scroll area, one row per line, so both sides stay aligned and scroll together.
  return (
    <div className={styles.viewer}>
      <div className={styles.header}>
        <span>Original</span>
        <span className={styles.headerRight}>
          Sanitized
          {copy}
        </span>
      </div>
      <div className={styles.body}>
        {lines.map((line) => (
          <div key={line.n} className={styles.row}>
            {(['original', 'sanitized'] as const).map((side) => (
              <div key={side} className={styles.line}>
                <span className={styles.ln}>{line.n}</span>
                <span className={styles.text}>
                  <Segments segments={line[side]} side={side} findings={findings} state={state} onHover={onHover} />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
