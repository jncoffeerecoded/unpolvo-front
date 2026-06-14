import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, cityPath, countryPath, profilePath } from "@/lib/seo";

// ISR: el sitemap se regenera cada hora e incluye automáticamente las
// publicaciones nuevas (sin rebuild). Antes era estático (congelado al build).
//
// Un sitemap admite hasta 50.000 URLs. Cuando los perfiles activos se acerquen
// a ese número, conviene partirlo en un índice + sub-sitemaps.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
  ];

  try {
    const [countries, profiles] = await Promise.all([
      prisma.country.findMany({ include: { cities: true } }),
      prisma.profile.findMany({
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
        take: 49000, // margen bajo el límite de 50.000
        select: {
          slug: true,
          updatedAt: true,
          city: { select: { slug: true } },
          country: { select: { code: true } },
        },
      }),
    ]);

    for (const c of countries) {
      entries.push({
        url: absoluteUrl(countryPath(c.code)),
        changeFrequency: "daily",
        priority: 0.8,
      });
      for (const city of c.cities) {
        entries.push({
          url: absoluteUrl(cityPath(c.code, city.slug)),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }

    for (const p of profiles) {
      entries.push({
        url: absoluteUrl(profilePath(p.country.code, p.city.slug, p.slug)),
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // BD no disponible (p. ej. durante el build sin conexión): al menos la home.
  }

  return entries;
}
