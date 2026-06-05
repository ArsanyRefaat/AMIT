const PREFIX = 'amt_public_';

export function readPublicCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: T };
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function writePublicCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // ignore quota errors
  }
}
