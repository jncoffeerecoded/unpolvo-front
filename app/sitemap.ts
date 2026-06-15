import type { MetadataRoute } from "next";
import { absoluteUrl, cityPath, countryPath, profilePath } from "@/lib/seo";
import { getCountriesWithCities, getAllActiveProfilePaths } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
  ];

  try {
    const [countries, profiles] = await Promise.all([
      getCountriesWithCities(),
      getAllActiveProfilePaths(),
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
        url: absoluteUrl(profilePath(p.countryCode, p.citySlug, p.slug)),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Si la API no responde durante el build, al menos devolvemos la home.
  }

  return entries;
}
