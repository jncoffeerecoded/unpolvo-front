// Cliente de la API del backend (unpolvo-back).
export const API_BASE = (
  process.env.BACKEND_URL ?? "http://localhost:3008"
).replace(/\/$/, "");

type GetOpts = { token?: string; revalidate?: number };

// GET tipado. Lanza en errores; usar getOrNull para 404 → null.
export async function apiGet<T>(path: string, opts: GetOpts = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : {},
    ...(opts.revalidate != null
      ? { next: { revalidate: opts.revalidate } }
      : { cache: "no-store" }),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} en ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function getOrNull<T>(
  path: string,
  opts: GetOpts = {},
): Promise<T | null> {
  try {
    return await apiGet<T>(path, opts);
  } catch {
    return null;
  }
}

// Mutación: devuelve el cuerpo JSON (que ya viene como { error, fieldErrors } o
// el dato de éxito) + el flag ok, para que las actions reenvíen el resultado.
export async function apiSend(
  path: string,
  init: {
    method: string;
    token?: string;
    json?: unknown;
    form?: FormData;
  },
): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const headers: Record<string, string> = {};
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  if (init.json) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method: init.method,
    headers,
    body: init.json ? JSON.stringify(init.json) : init.form,
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, body };
}
