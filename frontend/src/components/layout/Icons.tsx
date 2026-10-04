import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
};

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M2.5 7L8 2.5 13.5 7v6a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V7z" />
    <path d="M6.5 13.5V9h3v4.5" />
  </svg>
);

export const DownloadIcon = () => (
  <svg {...base}>
    <path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" />
  </svg>
);

export const UploadIcon = () => (
  <svg {...base}>
    <path d="M8 11.5v-8M4.5 6.5L8 3l3.5 3.5M3 13.5h10" />
  </svg>
);

export const ShieldIcon = () => (
  <svg {...base}>
    <path d="M8 2l5 1.9v3.8c0 3-2.1 5-5 6.3-2.9-1.3-5-3.3-5-6.3V3.9L8 2z" />
    <path d="M6 8l1.5 1.5L10.5 6.5" />
  </svg>
);

export const CopyIcon = () => (
  <svg {...base}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 5.5V4A1.5 1.5 0 009 2.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" />
  </svg>
);

export const CheckIcon = () => (
  <svg {...base}>
    <path d="M3 8.5l3.2 3L13 4.5" />
  </svg>
);

export const MenuIcon = () => (
  <svg {...base}>
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
  </svg>
);

export const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
    <rect width="32" height="32" rx="8" fill="#635BFF" />
    <path
      d="M16 7l8 3v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9v-6l8-3z"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
