import { auth } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

function mapPath(path: string): string {
  let p = path;
  if (p === '/api/me') p = '/api/auth/profile';
  if (p.startsWith('/api/auth/social')) p = p.replace('/api/auth/social', '/api/auth/social-login');
  if (p === '/api/upload') p = '/api/cloudinary/sign';
  // strip /api prefix
  if (p.startsWith('/api/')) p = p.slice(4); // -> /...
  return `${API_BASE}${p}`;
}

export function installClientFetchPatch() {
  if (typeof window === 'undefined') return;
  if ((window as any).__jgFetchPatched) return;
  (window as any).__jgFetchPatched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: any, init?: any) => {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input?.url;
    if (typeof url === 'string' && url.startsWith('/api/')) {
      const newUrl = mapPath(url);
      const token = auth.getAccessToken();
      const newInit = { ...(init || {}) };
      const headers = new Headers(newInit.headers || (typeof input !== 'string' ? input.headers : undefined));
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!headers.has('Content-Type') && newInit.body && typeof newInit.body === 'string') {
        // leave default; many calls set it
      }
      newInit.headers = headers;
      if (newInit.credentials === undefined) newInit.credentials = 'include';
      return originalFetch(newUrl, newInit);
    }
    return originalFetch(input, init);
  };
}