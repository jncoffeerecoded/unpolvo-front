import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotifications } from "@/lib/data";
import { profilePath } from "@/lib/seo";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { MarkRead } from "./MarkRead";

export const metadata: Metadata = {
  title: "Notificaciones",
  robots: { index: false, follow: false },
};

const ICON: Record<string, string> = {
  comment: "chat",
  like: "heart",
  rating: "star",
  message: "chat",
};

function text(type: string, actor: string, body: string | null): string {
  switch (type) {
    case "like":
      return `A ${actor} le gustó tu perfil`;
    case "rating":
      return `${actor} valoró tu perfil con ${body ?? "?"} ★`;
    case "comment":
      return `${actor} comentó: “${body ?? ""}”`;
    case "message":
      return `${actor} te envió un mensaje: “${body ?? ""}”`;
    default:
      return `${actor} interactuó con tu perfil`;
  }
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login?next=/notificaciones");

  const items = await getNotifications(session.accessToken);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <MarkRead />
      <h1 className="text-3xl font-bold">Notificaciones</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <Icon name="bell" className="mx-auto h-8 w-8" />
          <p className="mt-3">Todavía no tienes notificaciones.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((n) => {
            const actor = n.actor?.name ?? "Alguien";
            const href =
              n.type === "message"
                ? "/mensajes"
                : n.profile &&
                  profilePath(
                    n.profile.country.code,
                    n.profile.city.slug,
                    n.profile.slug,
                  );
            const row = (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  n.read ? "bg-card" : "bg-primary/5 border-primary/20"
                }`}
              >
                <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                  <Icon
                    name={ICON[n.type] ?? "bell"}
                    filled={n.type !== "comment" && n.type !== "message"}
                    className="h-4 w-4"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{text(n.type, actor, n.body)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.profile?.title} ·{" "}
                    {new Date(n.createdAt).toLocaleDateString("es")}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );
            return (
              <li key={n.id}>
                {href ? (
                  <Link href={href} className="block">
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
