/** Nest global prefix — keep in sync with `apps/api/src/main.ts`. */
export const API_PREFIX = '/api';

export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${normalized}`;
}
