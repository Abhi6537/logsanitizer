import type { FileKind } from '../../api/types';

const common = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true
};

export default function FileTypeIcon({ kind }: { kind: FileKind }) {
  if (kind === 'Image') {
    return (
      <svg {...common}>
        <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
        <circle cx="6" cy="6.5" r="1" />
        <path d="M2.5 11.5l3.5-3 3 2.5 2-1.5 2.5 2" />
      </svg>
    );
  }
  if (kind === 'JSON' || kind === 'YAML') {
    return (
      <svg {...common}>
        <path d="M6 3C4.5 3 4.5 4 4.5 5v1.5C4.5 7.5 3.5 8 3 8c.5 0 1.5.5 1.5 1.5V11c0 1 0 2 1.5 2M10 3c1.5 0 1.5 1 1.5 2v1.5c0 1 1 1.5 1.5 1.5-.5 0-1.5.5-1.5 1.5V11c0 1 0 2-1.5 2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 2.5h5l3 3v7.5a.5.5 0 01-.5.5h-7.5a.5.5 0 01-.5-.5v-10a.5.5 0 01.5-.5z" />
      <path d="M9 2.5v3h3M5.5 8.5h5M5.5 11h5" />
    </svg>
  );
}
