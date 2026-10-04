import { EntityCategory, VaultSession } from './types.js';
import { generateMock } from './replacer.js';

export class SessionVault {
  private sessions: Map<string, VaultSession> = new Map();
  private readonly defaultTtlMs: number;

  constructor(ttlMinutes = 60) {
    this.defaultTtlMs = ttlMinutes * 60 * 1000;
  }

  /**
   * Retrieves an existing session or creates a new one.
   */
  public getOrCreateSession(sessionId?: string): VaultSession {
    this.pruneExpiredSessions();

    const id = sessionId && sessionId.trim().length > 0 ? sessionId : this.generateSessionId();
    let session = this.sessions.get(id);

    if (!session) {
      session = {
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        realToMock: new Map(),
        mockToReal: new Map(),
        categoryCounters: new Map()
      };
      this.sessions.set(id, session);
    } else {
      session.updatedAt = Date.now();
    }

    return session;
  }

  /**
   * Deterministically fetches or creates a mock placeholder for a given original secret.
   */
  public getOrCreateMock(session: VaultSession, original: string, category: EntityCategory): string {
    const existing = session.realToMock.get(original);
    if (existing) {
      return existing;
    }

    const currentCount = session.categoryCounters.get(category) ?? 1;
    const mock = generateMock(category, currentCount);

    session.categoryCounters.set(category, currentCount + 1);
    session.realToMock.set(original, mock);
    session.mockToReal.set(mock, original);
    session.updatedAt = Date.now();

    return mock;
  }

  /**
   * Retrieves the real original value corresponding to a synthetic mock token.
   */
  public getOriginal(session: VaultSession, mock: string): string | undefined {
    return session.mockToReal.get(mock);
  }

  /**
   * Clears a specific session.
   */
  public clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Clears all sessions in the vault.
   */
  public clearAll(): void {
    this.sessions.clear();
  }

  /**
   * Auto-prunes expired sessions beyond their TTL.
   */
  private pruneExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.updatedAt > this.defaultTtlMs) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * Generates a short, clean, human-readable session ID (e.g. ck_9a2b1c).
   */
  private generateSessionId(): string {
    const chars = 'abcdef0123456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ck_${suffix}`;
  }
}

// Global shared default vault instance for standard in-memory operations
export const defaultVault = new SessionVault();
