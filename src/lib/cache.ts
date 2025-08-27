type CacheEntry<T> = { value: T; expiresAt: number };
const hour = 60 * 60 * 1000;

const mem = new Map<string, CacheEntry<unknown>>();

export function setCache<T>(key: string, value: T, ttlMs = hour) {
  const expiresAt = Date.now() + ttlMs;
  mem.set(key, { value, expiresAt });
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify({ value, expiresAt }));
  }
}

export function getCache<T>(key: string): T | null {
  const now = Date.now();

  // memory first
  const entry = mem.get(key);
  if (entry && entry.expiresAt > now) return entry.value as T;
  if (entry) mem.delete(key);

  // then localStorage
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CacheEntry<T>;
        if (parsed.expiresAt > now) {
          mem.set(key, parsed);
          return parsed.value;
        }
        localStorage.removeItem(key);
      } catch {
        localStorage.removeItem(key);
      }
    }
  }
  return null;
}
