import Link from "next/link";
import { auth } from "@/auth";
import { Icon } from "@/components/icons";
import { Flag } from "@/components/Flag";
import { Button } from "@/components/ui/button";
import { getCountries } from "@/lib/data";
import { detectCountryCode } from "@/lib/geo";
import { countryPath, SITE_NAME } from "@/lib/seo";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [countries, session] = await Promise.all([getCountries(), auth()]);
  const d = getDict("es");
  const isLoggedIn = !!session?.user;

  // Para visitantes sin sesión detectamos su país (por cabecera de geo del CDN)
  // y si no se puede, caemos al país con más perfiles (primero de la lista).
  let geoCountry: (typeof countries)[number] | null = null;
  if (!isLoggedIn && countries.length) {
    const code = await detectCountryCode();
    geoCountry =
      (code && countries.find((c) => c.code.toLowerCase() === code)) ||
      countries[0];
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-sm font-medium text-primary shadow-sm">
            <Icon name="shield-check" className="h-4 w-4" /> Perfiles verificados
          </span>

          {isLoggedIn ? (
            /* ─── Contenido para usuarios con sesión iniciada ─── */
            <>
              <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                {d.ui.tagline}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-primary">
                Encuentros calientes en tu ciudad
              </p>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                ¡Selecciona la ciudad o categoría que más te guste! El mejor portal de
                contactos para adultos, donde se publican anuncios clasificados eróticos
                completamente gratis. Disfruta de placenteros encuentros sexuales en tu
                ciudad. Citas románticas o sexo en Venezuela. Encuentra el anuncio
                clasificado que más te guste entre todas las categorías: escorts (mujeres
                y hombres), escorts gay, travestis, chica busca chica, swingers, busca alma
                gemela y busca amigos. Y si no encuentras tu pareja sexual, publica tu
                propio anuncio clasificado, es muy fácil y gratis. Descubre todos los
                servicios sexuales que ofrecen y los mejores masajes eróticos. ¡En
                citasaldia.com están los encuentros eróticos más calientes de la red!
                Cumple tus fantasías sexuales con {SITE_NAME}.
              </p>
            </>
          ) : (
            /* ─── Contenido para visitantes (SEO orientado a citas) ─── */
            <>
              <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                Encuentra pareja y conoce gente nueva cerca de ti
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-primary">
                Perfiles reales y verificados en tu ciudad
              </p>

              {/* Apartado «Encuentra chicas en {país}» con bandera → listado */}
              {geoCountry && (
                <Link
                  href={countryPath(geoCountry.code)}
                  className="group mx-auto mt-7 inline-flex items-center gap-3 rounded-full border bg-card px-6 py-3 text-base font-semibold shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <span>Encuentra chicas en {geoCountry.name}</span>
                  <Flag code={geoCountry.code} className="h-5 w-7" />
                  <Icon
                    name="chevronRight"
                    className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5"
                  />
                </Link>
              )}

              <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                En {SITE_NAME} conoces gente real y verificada cerca de ti. Explora
                miles de perfiles de citas y contactos organizados por país y ciudad,
                conecta por chat y empieza a conversar hoy mismo. Tanto si buscas
                pareja estable, una cita romántica, nuevas amistades o simplemente
                conocer personas afines a ti, aquí encuentras anuncios reales y
                verificados en tu zona. Regístrate gratis, publica tu perfil en
                segundos y descubre a quién tienes cerca. Citas seguras, perfiles
                verificados y contacto directo: así de fácil es encontrar a esa
                persona especial en {SITE_NAME}.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-11 rounded-full px-6 text-base">
              <Link href="/publicar">
                <Icon name="sparkles" className="h-5 w-5" />
                {d.ui.publish}
              </Link>
            </Button>
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
