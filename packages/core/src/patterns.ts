import { EntityCategory } from './types.js';

export interface PatternRule {
  category: EntityCategory;
  regex: RegExp;
  description: string;
}

/**
 * Curated high-precision regular expressions with boundary safeguards.
 * Order matters: specialized tokens (JWT, AWS, DB connection) execute first,
 * followed by general structures (IPv4, Email, UUID).
 */
export const PATTERN_RULES: PatternRule[] = [
  // 1. Private Key headers
  {
    category: 'PRIVATE_KEY',
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    description: 'PEM-encoded private key blocks'
  },

  // 2. Database Connection Strings (Postgres, MySQL, Mongo, Redis) with embedded passwords/hosts
  {
    category: 'CONNECTION_STRING',
    regex: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s"'`<>]+(?::\d+)?\/[^\s"'`<>]+/g,
    description: 'Database URIs with credentials and hostnames'
  },

  // 3. AWS Access Keys
  {
    category: 'AWS_KEY',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    description: 'AWS 20-character Access Key ID'
  },

  // 4. GitHub Personal Access & Fine-grained Tokens
  {
    category: 'GITHUB_TOKEN',
    regex: /\b(gh[pousr]_[A-Za-z0-9_]{36,255})\b/g,
    description: 'GitHub Authentication Token'
  },

  // 5. Stripe Secret & Restricted Keys
  {
    category: 'STRIPE_KEY',
    regex: /\b(sk_live_[0-9a-zA-Z_]{20,40}|rk_live_[0-9a-zA-Z_]{20,40})\b/g,
    description: 'Stripe Live Secret Key'
  },

  // 6. JSON Web Tokens (JWT)
  {
    category: 'JWT',
    regex: /\b(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g,
    description: 'Base64-encoded JSON Web Token'
  },

  // 7. Cloud Hostnames (AWS RDS, ElastiCache, Internal K8s services)
  {
    category: 'HOSTNAME',
    regex: /\b([a-zA-Z0-9-]+\.(?:[a-zA-Z0-9-]+\.)*rds\.amazonaws\.com|[a-zA-Z0-9-]+\.(?:default|svc)\.cluster\.local)\b/gi,
    description: 'Cloud provider internal hostnames'
  },

  // 8. IPv4 Addresses (Filtered strictly for standard valid octets, avoiding simple numbers)
  {
    category: 'IPV4',
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\b/g,
    description: 'Standard dotted-decimal IPv4 address'
  },

  // 9. Email addresses
  {
    category: 'EMAIL',
    regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    description: 'Email identity addresses'
  },

  // 10. UUIDs (standard 8-4-4-4-12 representation)
  {
    category: 'UUID',
    regex: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g,
    description: 'Standard RFC4122 UUID identifiers'
  }
];
