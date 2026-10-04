import { defaultVault, SessionVault } from './vault.js';

export interface RehydrateOptions {
  sessionId?: string;
  vault?: SessionVault;
}

export interface RehydrateResult {
  sessionId: string;
  rehydrated: string;
  replacementsCount: number;
  restoredTokens: Array<{ mock: string; original: string }>;
}

/**
 * Reverse rehydration engine.
 * Takes text (such as an AI model response with suggested code/fixes),
 * scans for synthetic mocks known in the active session, and restores
 * the real infrastructure parameters.
 */
export function rehydrate(input: string, options?: RehydrateOptions): RehydrateResult {
  const vault = options?.vault ?? defaultVault;
  const session = vault.getOrCreateSession(options?.sessionId);

  let result = input;
  let replacementsCount = 0;
  const restoredTokens: Array<{ mock: string; original: string }> = [];

  // Iterate over all active mappings in reverse (mock -> original)
  for (const [mock, original] of session.mockToReal.entries()) {
    if (result.includes(mock)) {
      result = result.replaceAll(mock, original);
      replacementsCount++;
      restoredTokens.push({ mock, original });
    }
  }

  return {
    sessionId: session.id,
    rehydrated: result,
    replacementsCount,
    restoredTokens
  };
}
