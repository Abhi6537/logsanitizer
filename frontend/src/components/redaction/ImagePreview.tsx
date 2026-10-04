import { useState } from 'react';
import type { Finding, Line } from '../../api/types';
import { CATEGORIES } from '../../lib/categories';
import styles from './ImagePreview.module.css';

type Stage = 'original' | 'regions' | 'sanitized';

const stages: { id: Stage; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'regions', label: 'Detected regions' },
  { id: 'sanitized', label: 'Sanitized' }
];

interface Props {
  lines: Line[];
  findings: Map<string, Finding>;
}

/**
 * Mock stand-in for the screenshot viewer: draws the captured text as an image-like
 * surface so the three stages (original, detected regions, sanitized) can be reviewed.
 * The real renderer will draw the uploaded image with region overlays instead.
 */
export default function ImagePreview({ lines, findings }: Props) {
  const [stage, setStage] = useState<Stage>('regions');

  return (
    <div>
      <div className={styles.controls} role="tablist" aria-label="Image view">
        {stages.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={stage === s.id}
            className={`${styles.segment} ${stage === s.id ? styles.selected : ''}`}
            onClick={() => setStage(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.surface}>
        {lines.map((line) => (
          <div key={line.n} className={styles.line}>
            {line.original.map((seg, i) => {
              const finding = seg.findingId ? findings.get(seg.findingId) : undefined;
              if (!finding || stage === 'original') return <span key={i}>{seg.text || ' '}</span>;
              return (
                <span
                  key={i}
                  className={stage === 'regions' ? styles.region : styles.masked}
                  title={stage === 'regions' ? CATEGORIES[finding.category].label : undefined}
                >
                  {seg.text}
                </span>
              );
            })}
            {line.original.every((s) => s.text === '') && ' '}
          </div>
        ))}
      </div>
      <p className={styles.caption}>Preview only. The uploaded image is rendered here once the backend is connected.</p>
    </div>
  );
}
