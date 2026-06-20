"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { decideSubscriber } from "@/app/subscriptions/actions";
import { formatPrice } from "@/app/[country]/[city]/[slug]/SubscribePanel";
import type { SubscriberView } from "@/lib/data";

const TABS = [
  { key: "pending", label: "Pendientes" },
  { key: "approved", label: "Aprobados" },
  { key: "rejected", label: "Rechazados" },
] as const;

export function SubscribersList({
  slug,
  initialSubscribers,
}: {
  slug: string;
  initialSubscribers: SubscriberView[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("pending");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();

  const counts = {
    pending: initialSubscribers.filter((s) => s.status === "pending").length,
    approved: initialSubscribers.filter((s) => s.status === "approved").length,
    rejected: initialSubscribers.filter((s) => s.status === "rejected").length,
  };
  const rows = initialSubscribers.filter((s) => s.status === tab);

  function decide(id: string, approve: boolean) {
    setPendingId(id);
    start(async () => {
      const res = await decideSubscriber(id, approve, slug);
      setPendingId(null);
      if (res.ok) {
        toast.success(approve ? "Suscriptor aprobado" : "Suscripción rechazada");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div>
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay suscriptores en esta lista.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3"
            >
              <Avatar
                name={s.subscriber.name}
                photoUrl={s.subscriber.image}
                className="h-11 w-11 shrink-0 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.subscriber.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.plan.name} · {formatPrice(s.plan.price, s.plan.currency)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {s.conversationId && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <Link href={`/mensajes/${s.conversationId}`}>
                      <Icon name="chat" className="h-4 w-4" />
                      Chat
                    </Link>
                  </Button>
                )}
                {s.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => decide(s.id, true)}
                      disabled={pendingId === s.id}
                    >
                      <Icon name="check" className="h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => decide(s.id, false)}
                      disabled={pendingId === s.id}
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {s.status === "approved" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => decide(s.id, false)}
                    disabled={pendingId === s.id}
                  >
                    Revocar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
