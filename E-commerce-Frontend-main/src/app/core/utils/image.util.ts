import { API_BASE_URL } from '../config/api.config';

const ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function toImageUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/?(uploads\/)?/, '');
  return `${ORIGIN}/uploads/${clean}`;
}
