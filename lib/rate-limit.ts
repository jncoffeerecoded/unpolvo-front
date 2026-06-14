// Rate limiter en memoria (ventana fija). Suficiente para una sola instancia
// (dev / self-hosted). En producción multi-instancia usa Redis (p.ej.
// @upstash/ratelimit) con la misma interfaz.

type Entry = { count: number; reset: number };

const store = new Map<string, Entry>();

export type RateResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();

  // Limpieza probabilística para que el Map no crezca sin control.
  if (Math.random() < 0.01) {
    for (const [k, v] of store) if (v.reset <= now) store.delete(k);
  }

  const entry = store.get(key);
  if (!entry || entry.reset <= now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count++;
  return {
    success: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.reset,
  };
}
