export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const POLLING_INTERVAL = 30000; // 30 seconds

export const DEFAULT_PAGINATION = {
  LIMIT: 10,
  SKIP: 0,
} as const;

export const THEME = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
} as const;
