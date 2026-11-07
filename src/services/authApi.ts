export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Error de conexión');
  return data as T;
}

const post = <T,>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const authApi = {
  me: () => request<{ user: AuthUser | null }>('/api/auth/me'),
  register: (email: string, password: string, name?: string) =>
    post<{ user: AuthUser }>('/api/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    post<{ user: AuthUser }>('/api/auth/login', { email, password }),
  google: (credential: string) => post<{ user: AuthUser }>('/api/auth/google', { credential }),
  logout: () => post<{ ok: true }>('/api/auth/logout'),
};