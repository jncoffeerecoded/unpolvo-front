import Link from "next/link";
import { cookies } from "next/headers";
import { Icon } from "@/components/icons";
import { Flag } from "@/components/Flag";
import { LocationPicker } from "@/components/LocationPicker";
import { Button } from "@/components/ui/button";
import { getCountries } from "@/lib/data";
import { countryPath, SITE_NAME } from "@/lib/seo";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const loc = cookieStore.get("loc")?.value || undefined;

  const countries = await getCountries();
  const d = getDict("es");

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
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Países */}
        <section>
          <h2 className="text-center text-2xl font-bold">{d.ui.chooseCountry}</h2>
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
