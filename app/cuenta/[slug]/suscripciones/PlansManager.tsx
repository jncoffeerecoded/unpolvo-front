"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  createPlan,
  deletePlan,
  deleteMedia,
} from "@/app/subscriptions/actions";
import { formatPrice } from "@/app/[country]/[city]/[slug]/SubscribePanel";
import type { AdminPlanView } from "@/lib/data";

export function PlansManager({
  profileId,
  initialPlans,
}: {
  profileId: string;
  slug: string;
  initialPlans: AdminPlanView[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const price = Number(fd.get("price"));
    const currency = String(fd.get("currency") ?? "USD").trim().toUpperCase() || "USD";
    const description = String(fd.get("description") ?? "").trim();
    if (!name || !(price >= 0)) {
      toast.error("Indica un nombre y un precio válidos.");
      return;
    }
    start(async () => {
      const res = await createPlan(profileId, { name, price, currency, description });
      if (res.ok) {
        toast.success("Plan creado");
        form.reset();
        setCreating(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function onDeletePlan(planId: string) {
    if (!confirm("¿Eliminar este plan y todo su contenido?")) return;
    start(async () => {
      const res = await deletePlan(planId);
      if (res.ok) {
        toast.success("Plan eliminado");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {initialPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          busy={pending}
          onDelete={() => onDeletePlan(plan.id)}
          onDeleteMedia={(mediaId) =>
            start(async () => {
              const res = await deleteMedia(mediaId);
              if (res.ok) router.refresh();
              else toast.error(res.error);
            })
          }
          onUploaded={() => router.refresh()}
        />
      ))}

      {creating ? (
        <form
          onSubmit={onCreate}
          className="space-y-3 rounded-2xl border bg-card p-4"
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del plan</Label>
              <Input id="name" name="name" placeholder="Ej. Pack mensual" maxLength={60} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                placeholder="9.99"
                className="w-28"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue="USD"
                maxLength={3}
                className="w-20 uppercase"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              maxLength={500}
              placeholder="Qué incluye este plan…"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreating(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Creando…" : "Crear plan"}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setCreating(true)} className="gap-1.5">
          <Icon name="plus" className="h-4 w-4" />
          Nuevo plan
        </Button>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  busy,
  onDelete,
  onDeleteMedia,
  onUploaded,
}: {
  plan: AdminPlanView;
  busy: boolean;
  onDelete: () => void;
  onDeleteMedia: (mediaId: string) => void;
  onUploaded: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    setUploading(true);
    try {
      const res = await fetch(`/api/subscriptions/plans/${plan.id}/media`, {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Contenido subido");
        onUploaded();
      } else {
        toast.error((body.error as string) ?? "No se pudo subir.");
      }
    } catch {
      toast.error("No se pudo subir.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{plan.name}</p>
          {plan.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {plan.subscriberCount} suscriptores · {plan.mediaCount} archivos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary">
            {formatPrice(plan.price, plan.currency)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={busy}
            aria-label="Eliminar plan"
          >
            <Icon name="trash" className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Media */}
      {plan.media.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {plan.media.map((m) => (
            <div key={m.id} className="group relative">
              {m.type === "video" ? (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted ring-1 ring-border">
                  <Icon name="video" className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/premium/${m.id}`}
                  alt=""
                  className="aspect-square w-full rounded-lg object-cover ring-1 ring-border"
                />
              )}
              <button
                type="button"
                onClick={() => onDeleteMedia(m.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Eliminar"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm"
          multiple
          className="sr-only"
          onChange={onFiles}
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Icon name="plus" className="h-4 w-4" />
          {uploading ? "Subiendo…" : "Añadir fotos/vídeos"}
        </Button>
      </div>
    </div>
  );
}
