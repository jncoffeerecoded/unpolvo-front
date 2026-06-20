"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { subscribeToPlan } from "@/app/subscriptions/actions";
import type { PlanView } from "@/lib/data";
import { PremiumGallery } from "./PremiumGallery";

type Status = "pending" | "approved" | "rejected";
type MineEntry = { planId: string; status: Status; conversationId: string | null };

export function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

export function SubscribePanel({
  plans,
  slug,
  path,
  isLoggedIn,
  isOwner,
}: {
  plans: PlanView[];
  slug: string;
  path: string;
  isLoggedIn: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [mine, setMine] = useState<Record<string, MineEntry>>({});
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => {
    if (!isLoggedIn || isOwner) return;
    let active = true;
    fetch("/api/subscriptions/mine", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((subs: MineEntry[]) => {
        if (!active) return;
        const map: Record<string, MineEntry> = {};
        for (const s of subs) map[s.planId] = s;
        setMine(map);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isLoggedIn, isOwner]);

  if (plans.length === 0) return null;

  function onSubscribe(planId: string) {
    setPendingPlan(planId);
    start(async () => {
      const res = await subscribeToPlan(planId);
      setPendingPlan(null);
      if (res.ok) {
        toast.success("Estás en lista de espera. Habla con el anunciante por el chat.");
        router.push(`/mensajes/${res.conversationId}`);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Icon name="crown" className="h-4 w-4 text-amber-500" />
          Contenido exclusivo
        </h2>
        {isOwner && (
          <Link
            href={`/cuenta/${slug}/suscripciones`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Administrar
          </Link>
        )}
      </div>

      <div className="space-y-2.5">
        {plans.map((plan) => {
          const entry = mine[plan.id];
          const status = entry?.status;
          return (
            <div key={plan.id} className="rounded-xl border bg-muted/20 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{plan.name}</p>
                  {plan.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="image" className="h-3.5 w-3.5" />
                      {plan.mediaCount} archivos
                    </span>
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary">
                  {formatPrice(plan.price, plan.currency)}
                </span>
              </div>

              {/* Acción según estado */}
              <div className="mt-3">
                {isOwner ? null : !isLoggedIn ? (
                  <Button asChild variant="secondary" size="sm" className="w-full gap-1.5">
                    <Link href={`/login?next=${encodeURIComponent(path)}`}>
                      <Icon name="lock" className="h-4 w-4" />
                      Inicia sesión para suscribirte
                    </Link>
                  </Button>
                ) : status === "approved" ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <Icon name="check" className="h-4 w-4" />
                      Suscripción activa
                    </p>
                    <PremiumGallery planId={plan.id} />
                  </div>
                ) : status === "pending" ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                      <Icon name="lock" className="h-4 w-4" />
                      En lista de espera
                    </span>
                    {entry?.conversationId && (
                      <Button asChild variant="outline" size="sm" className="gap-1.5">
                        <Link href={`/mensajes/${entry.conversationId}`}>
                          <Icon name="chat" className="h-4 w-4" />
                          Ir al chat
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full gap-1.5 bg-amber-500 text-white hover:bg-amber-600"
                    onClick={() => onSubscribe(plan.id)}
                    disabled={pendingPlan === plan.id}
                  >
                    <Icon name="crown" className="h-4 w-4" />
                    {pendingPlan === plan.id ? "Suscribiendo…" : "Suscribirme"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
