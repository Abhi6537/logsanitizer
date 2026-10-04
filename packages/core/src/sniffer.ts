import { LogFormat } from './types.js';

/**
 * Sniffs the format of a log payload to select optimal parsing strategy.
 */
export function sniffFormat(content: string): LogFormat {
  const trimmed = content.trim();

  // 1. JSON Sniff (Single JSON object, JSON array, or newline-delimited JSON)
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Fall through if not valid JSON
    }
  }

  // 2. Stacktrace Sniff
  // Matches typical Node/Python/Java stack frame lines
  const stackTracePattern = /(?:^\s*at\s+[\w$.<>]+\s+\(|Traceback \(most recent call last\):|^\s*File\s+".*",\s+line\s+\d+)/m;
  if (stackTracePattern.test(content)) {
    return 'stacktrace';
  }

  // 3. Env / Key-Value Sniff (KEY=VALUE lines)
  const envPattern = /^[A-Z0-9_]{3,}\s*=\s*.+$/m;
  if (envPattern.test(trimmed) && trimmed.split('\n').every((line) => !line.trim() || envPattern.test(line.trim()))) {
    return 'env';
  }

  return 'text';
}
