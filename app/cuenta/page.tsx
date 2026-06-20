import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyProfiles } from "@/lib/data";
import { profilePath } from "@/lib/seo";
import { Flag } from "@/components/Flag";
import { Stars } from "@/components/Stars";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Mis anuncios",
  robots: { index: false, follow: false },
};

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Activo", cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pendiente", cls: "bg-amber-100 text-amber-700" },
  paused: { label: "Pausado", cls: "bg-zinc-100 text-zinc-600" },
  rejected: { label: "Rechazado", cls: "bg-red-100 text-red-700" },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login?next=/cuenta");

  const profiles = await getMyProfiles(session.accessToken);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis anuncios</h1>
          <p className="text-muted-foreground">
            Hola, {session.user.name ?? session.user.email}.
          </p>
        </div>
        <Button asChild>
          <Link href="/publicar">
            <Icon name="sparkles" className="h-4 w-4" />
            Publicar nuevo
          </Link>
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed p-12 text-center">
          <p className="font-medium">Todavía no tienes anuncios.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Publica tu primer perfil para empezar a conocer gente.
          </p>
          <Button asChild className="mt-4">
            <Link href="/publicar">Crear mi primer anuncio</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {profiles.map((p) => {
            const st = STATUS[p.status] ?? STATUS.pending;
            const href = profilePath(p.countryCode, p.citySlug, p.slug);
            return (
              <div
                key={p.slug}
                className="flex items-center gap-4 rounded-2xl border bg-card p-3"
              >
                <Avatar
                  name={p.nickname}
                  photoUrl={p.photoUrl}
                  className="h-16 w-16 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold">{p.title}</h2>
                    {p.featured && <Badge variant="secondary">Destacado</Badge>}
                    {p.isVerified && (
                      <Icon name="shield-check" className="h-4 w-4 text-sky-500" />
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Flag code={p.countryCode} className="h-3.5 w-5" />
                    {p.cityName}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Stars value={p.ratingAvg} className="h-3 w-3" />
                      {p.ratingCount > 0 && (
                        <span className="font-medium text-foreground">
                          {p.ratingAvg.toFixed(1)}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="heart" className="h-3.5 w-3.5" /> {p.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="chat" className="h-3.5 w-3.5" /> {p.commentsCount}
                    </span>
                  </div>
                  <span
                    className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}
                  >
                    {st.label}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" size="sm">
                    <Link href={href}>Ver</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="gap-1.5">
                    <Link href={`/cuenta/${p.slug}/suscripciones`}>
                      <Icon name="crown" className="h-4 w-4 text-amber-500" />
                      Suscripciones
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
