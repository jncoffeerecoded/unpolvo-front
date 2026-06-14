import Link from "next/link";
import { cookies } from "next/headers";
import { Icon } from "@/components/icons";
import { Flag } from "@/components/Flag";
import { ProfileCard } from "@/components/ProfileCard";
import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/button";
import {
  getCountries,
  getPromotedProfiles,
  getRecentProfiles,
} from "@/lib/data";
import { countryPath, SITE_NAME } from "@/lib/seo";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const loc = cookieStore.get("loc")?.value || undefined;
  const filter = loc ? { countryCode: loc } : undefined;

  const [countries, promoted, recent] = await Promise.all([
    getCountries(),
    getPromotedProfiles(filter, 10),
    getRecentProfiles(filter, 15),
  ]);
  const d = getDict("es");
  const locName = countries.find((c) => c.code === loc)?.name;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-sm font-medium text-primary shadow-sm">
            <Icon name="shield-check" className="h-4 w-4" /> Perfiles verificados
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            {d.ui.tagline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {SITE_NAME} conecta personas por ciudad y país.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-11 rounded-full px-6 text-base">
              <Link href="/publicar">
                <Icon name="sparkles" className="h-5 w-5" />
                {d.ui.publish}
              </Link>
            </Button>
            <LocationPicker
              countries={countries.map((c) => ({ code: c.code, name: c.name }))}
              current={loc}
            />
          </div>

          {/* Banderas por país */}
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {countries.map((c) => (
              <Link
                key={c.id}
                href={countryPath(c.code)}
                title={c.name}
                className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium transition hover:border-primary/40 hover:text-primary"
              >
                <Flag code={c.code} className="h-4 w-6" />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12">
        {/* Promocionales */}
        {promoted.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Icon name="star" filled className="h-6 w-6 text-amber-400" />
              {d.ui.promoted}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {promoted.map((p) => (
                <ProfileCard key={p.slug} p={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recientes (filtrados por ubicación) */}
        <section>
          <h2 className="text-2xl font-bold">
            {locName ? `${d.ui.nearYou}: ${locName}` : d.ui.recentProfiles}
          </h2>
          {recent.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {recent.map((p) => (
                <ProfileCard key={p.slug} p={p} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-muted-foreground">{d.ui.noResults}</p>
          )}
        </section>

        {/* Países */}
        <section>
          <h2 className="text-2xl font-bold">{d.ui.chooseCountry}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {countries.map((c) => (
              <Link
                key={c.id}
                href={countryPath(c.code)}
                className="flex items-center justify-between rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <Flag code={c.code} className="h-8 w-11" />
                  <span>
                    <span className="block font-semibold">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c._count.profiles} {d.ui.profilesIn.split(" ")[0]} ·{" "}
                      {c._count.cities} ciudades
                    </span>
                  </span>
                </span>
                <Icon name="chevronRight" className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
