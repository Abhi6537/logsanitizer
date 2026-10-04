/**
 * Discrete categories of sensitive entities detected by Cloak.
 */
export type EntityCategory =
  | 'AWS_KEY'
  | 'GITHUB_TOKEN'
  | 'STRIPE_KEY'
  | 'PRIVATE_KEY'
  | 'JWT'
  | 'CONNECTION_STRING'
  | 'IPV4'
  | 'HOSTNAME'
  | 'EMAIL'
  | 'UUID';

/**
 * Details of a single detected and replaced entity.
 */
export interface MaskedOccurrence {
  category: EntityCategory;
  original: string;
  mock: string;
  index: number;
}

/**
 * A summary entry of counts and examples for UI reporting.
 */
export interface EntitySummary {
  category: EntityCategory;
  count: number;
  sampleOriginal: string;
  sampleMock: string;
}

/**
 * Result returned after sanitizing a string payload.
 */
export interface SanitizeResult {
  sessionId: string;
  sanitized: string;
  occurrences: MaskedOccurrence[];
  summary: EntitySummary[];
  totalMasked: number;
}

/**
 * Format classification sniffed by the engine.
 */
export type LogFormat = 'json' | 'stacktrace' | 'env' | 'text';

/**
 * Bidirectional storage mapping interface for session isolation.
 */
export interface VaultSession {
  id: string;
  createdAt: number;
  updatedAt: number;
  realToMock: Map<string, string>;
  mockToReal: Map<string, string>;
  categoryCounters: Map<EntityCategory, number>;
}
