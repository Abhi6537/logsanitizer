import { EntityCategory, EntitySummary, MaskedOccurrence, SanitizeResult } from './types.js';
import { PATTERN_RULES } from './patterns.js';
import { defaultVault, SessionVault } from './vault.js';
import { sniffFormat } from './sniffer.js';

export interface SanitizeOptions {
  sessionId?: string;
  vault?: SessionVault;
}

/**
 * Main forward sanitization function.
 * Scans text, identifies sensitive entities, maps them to deterministic mocks in the vault,
 * and returns clean text alongside audit summaries.
 */
export function sanitize(input: string, options?: SanitizeOptions): SanitizeResult {
  const vault = options?.vault ?? defaultVault;
  const session = vault.getOrCreateSession(options?.sessionId);
  const format = sniffFormat(input);

  if (format === 'json') {
    return sanitizeJsonPayload(input, session, vault);
  }

  return sanitizeTextPayload(input, session, vault);
}

/**
 * Text-based regex scanning with positional replacement.
 */
function sanitizeTextPayload(input: string, session: any, vault: SessionVault): SanitizeResult {
  let result = input;
  const occurrences: MaskedOccurrence[] = [];
  const categoryMap = new Map<EntityCategory, { count: number; sampleOrig: string; sampleMock: string }>();

  // Whitelist/preserve file paths & line numbers in stack traces
  // Matches e.g. /Users/username/... or C:\Users\username\...
  const homeDirPattern = /(?:(?:[A-Za-z]:\\|\/)Users[\\\/])([a-zA-Z0-9._-]+)/g;
  result = result.replace(homeDirPattern, (match, username) => {
    const mockUser = vault.getOrCreateMock(session, username, 'EMAIL');
    const cleanMock = mockUser.split('@')[0];
    return match.replace(username, cleanMock);
  });

  for (const rule of PATTERN_RULES) {
    const matches = Array.from(result.matchAll(rule.regex));
    for (const match of matches) {
      const original = match[0];
      if (!original || original.trim().length === 0) continue;

      const mock = vault.getOrCreateMock(session, original, rule.category);

      // Record occurrence
      occurrences.push({
        category: rule.category,
        original,
        mock,
        index: match.index ?? 0
      });

      // Update summary counter
      const existingSummary = categoryMap.get(rule.category);
      if (!existingSummary) {
        categoryMap.set(rule.category, { count: 1, sampleOrig: original, sampleMock: mock });
      } else {
        existingSummary.count++;
      }

      // Replace exact match safely
      result = result.replaceAll(original, mock);
    }
  }

  const summary: EntitySummary[] = Array.from(categoryMap.entries()).map(([cat, stats]) => ({
    category: cat,
    count: stats.count,
    sampleOriginal: stats.sampleOrig,
    sampleMock: stats.sampleMock
  }));

  return {
    sessionId: session.id,
    sanitized: result,
    occurrences,
    summary,
    totalMasked: occurrences.length
  };
}

/**
 * JSON-aware sanitization: parses into an AST/Object, scrubs string leaf values,
 * and re-serializes with exact whitespace/indentation preserved.
 */
function sanitizeJsonPayload(input: string, session: any, vault: SessionVault): SanitizeResult {
  try {
    const parsed = JSON.parse(input);
    const occurrences: MaskedOccurrence[] = [];
    const categoryMap = new Map<EntityCategory, { count: number; sampleOrig: string; sampleMock: string }>();

    function walkAndSanitize(value: unknown): unknown {
      if (typeof value === 'string') {
        let scrubbed = value;
        for (const rule of PATTERN_RULES) {
          const matches = Array.from(scrubbed.matchAll(rule.regex));
          for (const match of matches) {
            const original = match[0];
            const mock = vault.getOrCreateMock(session, original, rule.category);
            occurrences.push({
              category: rule.category,
              original,
              mock,
              index: match.index ?? 0
            });

            const stat = categoryMap.get(rule.category);
            if (!stat) {
              categoryMap.set(rule.category, { count: 1, sampleOrig: original, sampleMock: mock });
            } else {
              stat.count++;
            }

            scrubbed = scrubbed.replaceAll(original, mock);
          }
        }
        return scrubbed;
      } else if (Array.isArray(value)) {
        return value.map(walkAndSanitize);
      } else if (value !== null && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
          out[k] = walkAndSanitize(v);
        }
        return out;
      }
      return value;
    }

    const sanitizedObj = walkAndSanitize(parsed);
    const sanitizedJson = JSON.stringify(sanitizedObj, null, 2);

    const summary: EntitySummary[] = Array.from(categoryMap.entries()).map(([cat, stats]) => ({
      category: cat,
      count: stats.count,
      sampleOriginal: stats.sampleOrig,
      sampleMock: stats.sampleMock
    }));

    return {
      sessionId: session.id,
      sanitized: sanitizedJson,
      occurrences,
      summary,
      totalMasked: occurrences.length
    };
  } catch {
    // If parsing fails for any reason, gracefully fallback to text mode
    return sanitizeTextPayload(input, session, vault);
  }
}
