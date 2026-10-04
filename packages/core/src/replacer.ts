import { EntityCategory, VaultSession } from './types.js';

export interface ReplacerOptions {
  category: EntityCategory;
  original: string;
  session: VaultSession;
}

/**
 * Generates semantically valid, deterministic synthetic mocks.
 * Same original value in a session will always return the exact same mock.
 */
export function generateMock(category: EntityCategory, index: number): string {
  const paddedIndex = String(index).padStart(2, '0');

  switch (category) {
    case 'AWS_KEY':
      return `AKIA0000EXAMPLE${paddedIndex}`;

    case 'GITHUB_TOKEN':
      return `ghp_mock_token_${paddedIndex}_example000000`;

    case 'STRIPE_KEY':
      return `sk_live_mock_stripe_key_${paddedIndex}`;

    case 'PRIVATE_KEY':
      return `-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY_DATA_${paddedIndex}\n-----END PRIVATE KEY-----`;

    case 'JWT':
      return `<CLOAK_JWT_TOKEN_${paddedIndex}>`;

    case 'CONNECTION_STRING':
      return `postgresql://dev_usr_${paddedIndex}:mock_credential_${paddedIndex}@internal-mock-db-${paddedIndex}.mock:5432/sandbox_db`;

    case 'HOSTNAME':
      return `internal-mock-db-${paddedIndex}.mock`;

    case 'IPV4':
      // Map to 10.0.0.X private subnet
      return `10.0.0.${100 + (index % 150)}`;

    case 'EMAIL':
      return `dev_user_${paddedIndex}@example.internal`;

    case 'UUID':
      return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;

    default:
      return `<CLOAK_MOCK_${category}_${paddedIndex}>`;
  }
}
