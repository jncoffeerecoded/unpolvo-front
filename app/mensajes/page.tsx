import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyConversations } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mensajes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(iso).toLocaleDateString("es");
}

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login?next=/mensajes");

  const convs = await getMyConversations(session.accessToken);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Mensajes</h1>

      {convs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <Icon name="chat" className="mx-auto h-8 w-8" />
          <p className="mt-3">Todavía no tienes conversaciones.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {convs.map((c) => (
            <li key={c.id}>
              <Link
                href={`/mensajes/${c.id}`}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:bg-muted/40 ${
                  c.unread > 0 ? "border-primary/30 bg-primary/5" : "bg-card"
                }`}
              >
                <Avatar
                  name={c.otherName}
                  photoUrl={c.otherImage}
                  className="h-11 w-11 shrink-0 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{c.otherName}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(c.lastMessageAt)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.role === "owner" ? "Sobre tu anuncio" : c.profile.nickname} ·{" "}
                    {c.lastMessage ?? "Sin mensajes"}
                  </p>
                  {c.status === "pending" && (
                    <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                      {c.role === "owner" ? "Solicitud nueva" : "Pendiente de respuesta"}
                    </span>
                  )}
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {c.unread > 9 ? "9+" : c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
