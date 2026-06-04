import { API_BASE } from '@/lib/api';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

function defaultErrorMessage(status: number): string {
  if (status === 401) return 'Please sign in again.';
  if (status >= 500) return 'Server is busy. Wait a moment and try again.';
  return 'Could not save. Check your entries and try again.';
}

export async function apiJson<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  const { method = 'GET', body } = options;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body != null ? { 'Content-Type': 'application/json' } : undefined,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
      let message = text || defaultErrorMessage(res.status);
      try {
        const parsed = JSON.parse(text);
        if (parsed?.error) message = String(parsed.error);
      } catch {
        // use message as-is
      }
      return { ok: false, message };
    }
    const data = (text ? JSON.parse(text) : {}) as T;
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Network error. Check your connection.',
    };
  }
}
