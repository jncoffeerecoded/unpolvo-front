import { headers } from "next/headers";

// Cabeceras de geolocalización que inyectan los CDN/proxys más habituales.
// Railway no añade geo por sí solo: si el sitio va detrás de Cloudflare,
// `cf-ipcountry` llega gratis. El resto cubre Vercel, GAE y proxys genéricos.
const GEO_HEADERS = [
  "cf-ipcountry", // Cloudflare
  "x-vercel-ip-country", // Vercel
  "x-geo-country",
  "x-country-code",
  "x-appengine-country", // Google App Engine
];

// Devuelve el código ISO-2 en minúsculas (ej. "ve") o null si no se detecta.
export async function detectCountryCode(): Promise<string | null> {
  const h = await headers();
  for (const key of GEO_HEADERS) {
    const v = h.get(key)?.trim().toLowerCase();
    // "xx"/"t1" son valores reservados (red Tor, desconocido) → se descartan.
    if (v && v.length === 2 && v !== "xx" && v !== "t1") return v;
  }
  return null;
}
