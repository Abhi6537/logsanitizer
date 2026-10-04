// Mock data layer. The real backend will replace this module; keep the exported
// function signatures stable so pages do not change.
import type { RedactionDetail, RestoreResult, RestoreSegment, UploadCallbacks, UploadRecord } from './types';
import { kindFromName } from '../lib/format';
import { buildDetail } from './mockDetail';

export class NotFoundError extends Error {
  constructor() {
    super('Not found');
    this.name = 'NotFoundError';
  }
}

const day = (daysAgo: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 23, 0, 0);
  return d.toISOString();
};

const store: UploadRecord[] = [
  { id: 'r1', name: 'error.log', kind: 'Log', size: 12 * 1024, status: 'redacted', findings: 7, redactions: 7, createdAt: day(0) },
  { id: 'r2', name: 'stacktrace.txt', kind: 'Text', size: 8 * 1024, status: 'redacted', findings: 12, redactions: 12, createdAt: day(1) },
  { id: 'r3', name: 'screenshot.png', kind: 'Image', size: 1.2 * 1024 * 1024, status: 'redacted', findings: 23, redactions: 23, createdAt: day(2) },
  { id: 'r4', name: 'api-response.json', kind: 'JSON', size: 6 * 1024, status: 'redacted', findings: 5, redactions: 5, createdAt: day(3) }
];

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    });
  });

export async function listUploads(): Promise<UploadRecord[]> {
  await wait(400);
  return [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Redaction history. Same records as uploads; the real API may split these. */
export async function listRedactions(): Promise<UploadRecord[]> {
  return listUploads();
}

export async function getRedaction(id: string): Promise<RedactionDetail> {
  await wait(500);
  const record = store.find((r) => r.id === id);
  if (!record) throw new NotFoundError();
  return buildDetail(record);
}

/** Swap this redaction's placeholders in an AI response back for the real values. */
export async function restoreResponse(id: string, text: string): Promise<RestoreResult> {
  await wait(300);
  const record = store.find((r) => r.id === id);
  if (!record) throw new NotFoundError();

  const originals = new Map<string, string>();
  buildDetail(record).findings.forEach((f) => originals.set(f.replacement, f.original));

  const segments: RestoreSegment[] = [];
  let restored = 0;
  let unknown = 0;
  let last = 0;

  for (const match of text.matchAll(/\[[A-Z_]+_\d+\]/g)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ text: text.slice(last, start), kind: 'text' });
    const original = originals.get(match[0]);
    if (original) {
      segments.push({ text: original, kind: 'restored' });
      restored++;
    } else {
      segments.push({ text: match[0], kind: 'unknown' });
      unknown++;
    }
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), kind: 'text' });

  return { segments, restored, unknown };
}

export async function uploadFile(file: File, { onProgress, onProcessing, signal }: UploadCallbacks): Promise<UploadRecord> {
  if (file.size === 0) throw new Error('This file is empty.');

  for (let pct = 0; pct < 100; pct += 20) {
    onProgress(pct);
    await wait(180, signal);
  }
  onProgress(100);

  onProcessing();
  await wait(1200, signal);

  const findings = 3 + ((file.size + file.name.length) % 9);
  const record: UploadRecord = {
    id: `r${Date.now()}`,
    name: file.name,
    kind: kindFromName(file.name),
    size: file.size,
    status: 'redacted',
    findings,
    redactions: findings,
    createdAt: new Date().toISOString()
  };
  store.unshift(record);
  return record;
}
