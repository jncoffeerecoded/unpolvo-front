import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { Flag } from "@/components/Flag";
import { CitySelect } from "@/components/CitySelect";
import { ProfileCard } from "@/components/ProfileCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCountry, getPromotedProfiles, getRegularProfiles } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import {
  absoluteUrl,
  buildTitle,
  cityPath,
  countryPath,
  SITE_NAME,
} from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const c = await getCountry(country);
  if (!c) return {};
  return {
    title: c.name,
    description: `Perfiles de citas en ${c.name}. Explora por ciudad y conoce gente verificada.`,
    alternates: { canonical: absoluteUrl(countryPath(c.code)) },
    openGraph: {
      title: buildTitle([c.name]),
      url: absoluteUrl(countryPath(c.code)),
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const c = await getCountry(country);
  if (!c) notFound();

  const d = getDict(c.locale);
  const loc = { countryCode: c.code };
  const [featured, regular] = await Promise.all([
    getPromotedProfiles(loc, 10),
    getRegularProfiles(loc, 24),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs items={[{ name: d.ui.home, href: "/" }, { name: c.name }]} />

      <header className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Flag code={c.code} className="h-10 w-14" />
          <div>
            <h1 className="text-3xl font-bold">{c.name}</h1>
            <p className="text-muted-foreground">
              {c._count.profiles} {d.ui.profilesIn} {c.name}
            </p>
          </div>
        </div>
        <CitySelect
          country={c.code}
          cities={c.cities.map((ci) => ({ slug: ci.slug, name: ci.name }))}
        />
      </header>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Icon name="star" filled className="h-5 w-5 text-amber-400" />
            {d.ui.promoted}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProfileCard key={p.slug} p={p} locale={c.locale} />
            ))}
          </div>
        </section>
      )}

      {/* Normal */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">{d.ui.recentProfiles}</h2>
        {regular.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {regular.map((p) => (
              <ProfileCard key={p.slug} p={p} locale={c.locale} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">{d.ui.noResults}</p>
        )}
      </section>

      {/* Ciudades */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">{d.ui.popularCities}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {c.cities.map((city) => (
            <Link
              key={city.id}
              href={cityPath(c.code, city.slug)}
              className="flex items-center justify-between rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Icon name="mapPin" className="h-4 w-4 text-primary" />
                <span className="font-medium">{city.name}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {city._count.profiles}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
