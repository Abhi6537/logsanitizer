import type { FindingCategory } from '../api/types';

interface CategoryInfo {
  label: string;
  /** Prefix used in placeholders, e.g. [API_KEY_1]. */
  prefix: string;
  /** Small dot color in badges. Muted so the table does not turn into a rainbow. */
  dot: string;
}

export const CATEGORIES: Record<FindingCategory, CategoryInfo> = {
  api_key: { label: 'API Key', prefix: 'API_KEY', dot: '#635bff' },
  token: { label: 'Token', prefix: 'TOKEN', dot: '#8b7cf6' },
  password: { label: 'Password', prefix: 'PASSWORD', dot: '#c0362c' },
  email: { label: 'Email', prefix: 'EMAIL', dot: '#2f80b7' },
  ip: { label: 'IP Address', prefix: 'IP_ADDRESS', dot: '#2a9d8f' },
  internal_url: { label: 'Internal URL', prefix: 'INTERNAL_URL', dot: '#c98a1b' },
  hostname: { label: 'Internal Hostname', prefix: 'HOSTNAME', dot: '#b7791f' },
  file_path: { label: 'File Path', prefix: 'FILE_PATH', dot: '#6b7280' },
  database_url: { label: 'Database URL', prefix: 'DATABASE_URL', dot: '#a24b8f' },
  env_var: { label: 'Environment Variable', prefix: 'ENV_VAR', dot: '#4b8f5a' },
  personal: { label: 'Personal Information', prefix: 'PERSONAL_INFO', dot: '#d9480f' }
};
