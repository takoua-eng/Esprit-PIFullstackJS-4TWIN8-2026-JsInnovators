/** Backend API origin (no trailing slash). Override via `window` in index.html if needed. */
export const API_BASE_URL =
  (typeof window !== 'undefined' &&
    (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL__) ||
  'http://localhost:3000';
