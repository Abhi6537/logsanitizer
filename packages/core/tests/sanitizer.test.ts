import { describe, it, expect, beforeEach } from 'vitest';
import { sanitize, rehydrate, SessionVault } from '../src/index.js';

describe('Cloak Core Engine', () => {
  let vault: SessionVault;

  beforeEach(() => {
    vault = new SessionVault();
  });

  it('masks AWS access keys and JWT tokens', () => {
    const raw = `Error: Authentication failed with AWS Key AKIA3XF8BGHJ72KDS9F1 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
    const res = sanitize(raw, { vault });

    expect(res.totalMasked).toBe(2);
    expect(res.sanitized).not.toContain('AKIA3XF8BGHJ72KDS9F1');
    expect(res.sanitized).toContain('AKIA0000EXAMPLE01');
    expect(res.sanitized).toContain('<CLOAK_JWT_TOKEN_01>');
  });

  it('guarantees deterministic replacement for duplicate occurrences', () => {
    const raw = `Host db-01.us-east-1.rds.amazonaws.com failed. Retrying db-01.us-east-1.rds.amazonaws.com in 5s.`;
    const res = sanitize(raw, { vault });

    expect(res.sanitized).not.toContain('db-01.us-east-1.rds.amazonaws.com');
    // Both occurrences must use the exact same mock token
    const occurrences = res.sanitized.match(/internal-mock-db-01\.mock/g);
    expect(occurrences?.length).toBe(2);
  });

  it('sanitizes emails and IPv4 addresses accurately', () => {
    const raw = `Alert sent to admin@enterprise.com from origin 192.168.1.105`;
    const res = sanitize(raw, { vault });

    expect(res.sanitized).not.toContain('admin@enterprise.com');
    expect(res.sanitized).not.toContain('192.168.1.105');
    expect(res.sanitized).toContain('dev_user_01@example.internal');
    expect(res.sanitized).toContain('10.0.0.101');
  });

  it('performs end-to-end two-way rehydration', () => {
    const originalLog = `Database postgresql://super_admin:s3cr3tP@ss@prod-cluster.us-east-1.rds.amazonaws.com:5432/main failed. Host is prod-cluster.us-east-1.rds.amazonaws.com.`;
    const sanitizedRes = sanitize(originalLog, { vault });

    // The connection string is masked as CONNECTION_STRING, and the standalone host as HOSTNAME
    const aiResponse = `To debug, run this check:\npsql -h internal-mock-db-01.mock -U postgres -p 5432`;

    const restoredRes = rehydrate(aiResponse, { vault, sessionId: sanitizedRes.sessionId });

    expect(restoredRes.rehydrated).toContain('prod-cluster.us-east-1.rds.amazonaws.com');
    expect(restoredRes.rehydrated).not.toContain('internal-mock-db-01.mock');
  });

  it('preserves JSON log AST structure validity', () => {
    const jsonLog = JSON.stringify({
      level: 'error',
      user: 'alice@company.org',
      ip: '10.240.0.4',
      meta: {
        token: 'ghp_mock_token_for_test_ABCDEFGHIJKLMNOP012'
      }
    });

    const res = sanitize(jsonLog, { vault });
    expect(() => JSON.parse(res.sanitized)).not.toThrow();

    const parsed = JSON.parse(res.sanitized);
    expect(parsed.user).toBe('dev_user_01@example.internal');
    expect(parsed.ip).toBe('10.0.0.101');
    expect(parsed.meta.token).toContain('ghp_mock_token_');
  });
});
