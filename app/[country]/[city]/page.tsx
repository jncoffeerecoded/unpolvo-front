import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileCard } from "@/components/ProfileCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Flag } from "@/components/Flag";
import { Icon } from "@/components/icons";
import { getCity, getPromotedProfiles, getRegularProfiles } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import {
  absoluteUrl,
  buildTitle,
  cityPath,
  countryPath,
  SITE_NAME,
} from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ country: string; city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, city } = await params;
  const c = await getCity(country, city);
  if (!c) return {};
  return {
    title: `Citas en ${c.name}`,
    description: `Conoce gente verificada en ${c.name}, ${c.country.name}.`,
    alternates: { canonical: absoluteUrl(cityPath(country, city)) },
    openGraph: {
      title: buildTitle([`Citas en ${c.name}`]),
      url: absoluteUrl(cityPath(country, city)),
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { country, city } = await params;
  const c = await getCity(country, city);
  if (!c) notFound();

  const d = getDict(c.country.locale);
  const loc = { countryCode: country, citySlug: city };
  const [featured, regular] = await Promise.all([
    getPromotedProfiles(loc, 10),
    getRegularProfiles(loc, 48),
  ]);
  const total = featured.length + regular.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumbs
        items={[
          { name: d.ui.home, href: "/" },
          { name: c.country.name, href: countryPath(country) },
          { name: c.name },
        ]}
      />

      <header className="mt-4 flex items-center gap-3">
        <Flag code={c.country.code} className="h-9 w-12" />
        <div>
          <h1 className="text-3xl font-bold">Citas en {c.name}</h1>
          <p className="text-muted-foreground">
            {total} {d.ui.profilesIn} {c.name}
          </p>
        </div>
      </header>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Icon name="star" filled className="h-5 w-5 text-amber-400" />
            {d.ui.promoted}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {featured.map((p) => (
              <ProfileCard key={p.slug} p={p} locale={c.country.locale} />
            ))}
          </div>
        </section>
      )}

      {/* Normal */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{d.ui.recentProfiles}</h2>
        {regular.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {regular.map((p) => (
              <ProfileCard key={p.slug} p={p} locale={c.country.locale} />
            ))}
          </div>
        ) : (
          total === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed p-12 text-center">
              <p className="font-medium">{d.ui.noResults}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d.ui.beFirst}</p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
