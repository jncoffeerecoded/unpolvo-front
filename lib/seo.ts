// Configuración del sitio + helpers de rutas, canonical y datos estructurados.

export const SITE_NAME = "CitasAlDia";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ─── Rutas canónicas /{pais}/{ciudad}/{slug} ───────────────────
export const countryPath = (country: string) => `/${country}`;

export const cityPath = (country: string, city: string) =>
  `/${country}/${city}`;

export const profilePath = (country: string, city: string, slug: string) =>
  `/${country}/${city}/${slug}`;

export function buildTitle(parts: (string | undefined)[]): string {
  return [...parts.filter(Boolean), SITE_NAME].join(" · ");
}

// Bandera emoji a partir del código ISO de país (ej: "es" → 🇪🇸).
export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Serializa JSON-LD evitando inyección al cerrar el <script> (XSS).
export function jsonLdString(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── Datos estructurados (JSON-LD) ─────────────────────────────
type ProfileLd = {
  name: string;
  description: string;
  url: string;
  image?: string;
  gender?: string;
  city?: string;
  country?: string;
};

export function profileJsonLd(p: ProfileLd) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateModified: new Date().toISOString(),
    mainEntity: {
      "@type": "Person",
      name: p.name,
      description: p.description,
      url: p.url,
      ...(p.image ? { image: p.image } : {}),
      ...(p.gender ? { gender: p.gender } : {}),
      ...(p.city || p.country
        ? {
            homeLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                ...(p.city ? { addressLocality: p.city } : {}),
                ...(p.country ? { addressCountry: p.country } : {}),
              },
            },
          }
        : {}),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
