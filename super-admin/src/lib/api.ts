const API_BASE = import.meta.env.VITE_API_URL || '';

const BACKEND_NOT_RUNNING_MSG =
  "Backend ga ulanish imkonsiz. Avval serverni ishga tushiring: loyiha ildizida «npm run dev:server» yoki server/ papkasida «npm run dev».";

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError && e.message === 'Failed to fetch') return true;
  if (e instanceof Error && /fetch|network|connection refused/i.test(e.message)) return true;
  return false;
}

export function getAdminToken() {
  return localStorage.getItem('admin_token') || '';
}

export async function adminFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const url = API_BASE ? `${API_BASE}/api/admin${path}` : `/api/admin${path}`;
  try {
    const res = await fetch(url, {
      ...opts,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    return res.json();
  } catch (e: unknown) {
    if (isNetworkError(e)) throw new Error(BACKEND_NOT_RUNNING_MSG);
    throw e;
  }
}

export const api = {
  login: async (login: string, password: string) => {
    const url = API_BASE ? `${API_BASE}/api/admin/auth/login` : '/api/admin/auth/login';
    try {
      const res = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
      }
      const data = await res.json();
      if (data.token) localStorage.setItem('admin_token', data.token);
      return { ok: true, admin: data.admin };
    } catch (e: unknown) {
      if (isNetworkError(e)) throw new Error(BACKEND_NOT_RUNNING_MSG);
      throw e;
    }
  },

  stats: () => adminFetch<{
    totalUsers: number;
    totalPro: number;
    totalOutfits: number;
    totalAiRequests: number;
    usersLast7Days: number;
    aiRequestsLast7Days: number;
  }>('/stats'),

  statsDaily: () => adminFetch<{
    labels: string[];
    users: { date: string; users: number }[];
    aiRequests: { date: string; aiRequests: number }[];
    outfits: { date: string; outfits: number }[];
  }>('/stats/daily'),

  users: {
    list: () => adminFetch<any[]>('/users'),
    get: (id: number) => adminFetch<any>(`/users/${id}`),
    delete: (id: number) => adminFetch<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  },

  subscriptions: {
    list: () => adminFetch<any[]>('/subscriptions'),
    create: (data: { userId: number; plan?: string; expiresAt?: string }) =>
      adminFetch<any>('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { plan?: string; expiresAt?: string }) =>
      adminFetch<any>(`/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      adminFetch<{ ok: boolean }>(`/subscriptions/${id}`, { method: 'DELETE' }),
  },

  aiRequests: {
    list: () => adminFetch<any[]>('/ai-requests'),
    delete: (id: number) =>
      adminFetch<{ ok: boolean }>(`/ai-requests/${id}`, { method: 'DELETE' }),
  },

  styles: {
    list: () => adminFetch<{ styles: Record<string, unknown>[] }>('/styles').then((d) => d.styles ?? []),
    create: (data: { key: string; name_en?: string; name_ru?: string; name_uz?: string; image_url?: string; description?: string }) =>
      adminFetch<any>('/styles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{ key: string; name_en: string; name_ru: string; name_uz: string; image_url: string; description: string }>) =>
      adminFetch<any>(`/styles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      adminFetch<{ ok: boolean }>(`/styles/${id}`, { method: 'DELETE' }),
  },

};
