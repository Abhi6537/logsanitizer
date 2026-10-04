export type FileKind = 'Log' | 'Text' | 'JSON' | 'YAML' | 'Image';

export type RecordStatus = 'redacted' | 'processing' | 'failed';

export interface UploadRecord {
  id: string;
  name: string;
  kind: FileKind;
  /** Size in bytes. */
  size: number;
  status: RecordStatus;
  findings: number;
  redactions: number;
  /** ISO timestamp. */
  createdAt: string;
}

export type FindingCategory =
  | 'api_key'
  | 'token'
  | 'password'
  | 'email'
  | 'ip'
  | 'internal_url'
  | 'hostname'
  | 'file_path'
  | 'database_url'
  | 'env_var'
  | 'personal';

export interface Finding {
  id: string;
  category: FindingCategory;
  original: string;
  replacement: string;
  /** 1-based line number the value appears on. */
  line: number;
}

/** A run of text on a line. Sensitive runs carry the id of their finding. */
export interface Segment {
  text: string;
  findingId?: string;
}

/** One aligned line: the same line before and after redaction. */
export interface Line {
  n: number;
  original: Segment[];
  sanitized: Segment[];
}

export interface RedactionDetail {
  record: UploadRecord;
  lines: Line[];
  findings: Finding[];
}

export interface RestoreSegment {
  text: string;
  /** restored: a known placeholder swapped for its real value; unknown: a placeholder-shaped token we have no mapping for. */
  kind: 'text' | 'restored' | 'unknown';
}

export interface RestoreResult {
  segments: RestoreSegment[];
  /** Number of placeholders replaced with real values. */
  restored: number;
  /** Number of placeholder-shaped tokens left as-is. */
  unknown: number;
}

export interface UploadCallbacks {
  /** 0 to 100 while the file is being uploaded. */
  onProgress: (percent: number) => void;
  /** Called once the upload is done and scanning begins. */
  onProcessing: () => void;
  signal?: AbortSignal;
}
