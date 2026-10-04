// Generates mock before/after content for a redaction record.
// Replaced wholesale when the real backend provides this data.
import type { Finding, FindingCategory, Line, RedactionDetail, Segment, UploadRecord } from './types';
import { CATEGORIES } from '../lib/categories';

type Part = string | { c: FindingCategory; v: string };

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/** Deterministic fake secret material, so the same record always renders the same. */
function fake(seed: number, length: number): string {
  let s = seed * 9301 + 49297;
  let out = '';
  for (let i = 0; i < length; i++) {
    s = (s * 9301 + 49297) % 233280;
    out += CHARS[s % CHARS.length];
  }
  return out;
}

const pool: Array<(k: number) => Part[]> = [
  (k) => ['DB_HOST=', { c: 'hostname', v: `prod-db-${String(k).padStart(2, '0')}.internal.company.com` }],
  (k) => ['DB_USER=', { c: 'email', v: `user${k}@example.com` }],
  (k) => ['API_KEY=', { c: 'api_key', v: `sk_live_${fake(k, 24)}` }],
  (k) => ['Request from ', { c: 'ip', v: `192.168.1.${10 + k}` }],
  (k) => ['Path=', { c: 'file_path', v: `/home/user/projects/service-${k}/` }],
  (k) => ['DB_PASSWORD=', { c: 'password', v: `pw-${fake(k + 50, 14)}` }],
  (k) => ['DATABASE_URL=', { c: 'database_url', v: `postgres://app:${fake(k + 7, 8)}@db-${k}.internal:5432/main` }],
  (k) => ['AUTH_TOKEN=', { c: 'token', v: `ghp_${fake(k + 99, 30)}` }]
];

/** The sample from the design spec. */
const errorLog: Part[][] = [
  ['Error: Failed to connect to database'],
  [''],
  ['DB_HOST=', { c: 'hostname', v: 'prod-db-07.internal.company.com' }],
  ['DB_USER=', { c: 'email', v: 'piuli@example.com' }],
  ['DB_PASSWORD=', { c: 'password', v: 'hunter2-prod-secret' }],
  ['API_KEY=', { c: 'api_key', v: 'sk_live_51Hxxxxxxxxxxxxxxxxxxxxxx' }],
  ['AWS_ACCESS_KEY_ID=', { c: 'api_key', v: 'AKIAIOSFODNN7EXAMPLE' }],
  ['Request from ', { c: 'ip', v: '192.168.1.24' }],
  ['Path=', { c: 'file_path', v: '/home/piuli/projects/payment-service/' }]
];

function generated(count: number): Part[][] {
  const rows: Part[][] = [['Error: Failed to connect to database'], ['']];
  for (let k = 1; k <= count; k++) {
    rows.push(pool[(k - 1) % pool.length](k));
    if (k % 3 === 0 && k < count) rows.push([`INFO retrying connection (attempt ${k / 3})`]);
  }
  return rows;
}

function build(rows: Part[][], isImage: boolean): { lines: Line[]; findings: Finding[] } {
  const findings: Finding[] = [];
  const counters = new Map<FindingCategory, number>();
  const tokens = new Map<string, string>();

  const lines = rows.map((parts, i) => {
    const original: Segment[] = [];
    const sanitized: Segment[] = [];

    for (const part of parts) {
      if (typeof part === 'string') {
        original.push({ text: part });
        sanitized.push({ text: part });
        continue;
      }
      let token = tokens.get(part.v);
      if (!token) {
        const next = (counters.get(part.c) ?? 0) + 1;
        counters.set(part.c, next);
        token = `[${CATEGORIES[part.c].prefix}_${next}]`;
        tokens.set(part.v, token);
      }
      const id = `f${findings.length + 1}`;
      findings.push({
        id,
        category: part.c,
        original: part.v,
        replacement: isImage ? '[MASKED]' : token,
        line: i + 1
      });
      original.push({ text: part.v, findingId: id });
      // For images the sanitized view blacks the value out, so keep its width.
      sanitized.push({ text: isImage ? part.v : token, findingId: id });
    }
    return { n: i + 1, original, sanitized };
  });

  return { lines, findings };
}

export function buildDetail(record: UploadRecord): RedactionDetail {
  const rows = record.id === 'r1' ? errorLog : generated(record.findings);
  const { lines, findings } = build(rows, record.kind === 'Image');

  // Keep the record's counts consistent with what the detail actually shows.
  return {
    record: { ...record, findings: findings.length, redactions: findings.length },
    lines,
    findings
  };
}
