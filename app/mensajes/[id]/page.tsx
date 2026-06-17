import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getConversation } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { Chat } from "./Chat";

export const metadata: Metadata = {
  title: "Conversación",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session?.accessToken) redirect("/login?next=/mensajes");

  const { id } = await params;
  const conv = await getConversation(id, session.accessToken);
  if (!conv) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/mensajes"
          className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
          aria-label="Volver a mensajes"
        >
          <Icon name="chevronRight" className="h-5 w-5 rotate-180" />
        </Link>
        <Avatar
          name={conv.otherName}
          photoUrl={conv.otherImage}
          className="h-10 w-10 rounded-full"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{conv.otherName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conv.role === "owner" ? "Mensaje sobre tu anuncio" : "Anuncio de "}
            {conv.role === "guest" && conv.profile.nickname}
          </p>
        </div>
      </div>

      <Chat initial={conv} />
    </div>
  );
}
