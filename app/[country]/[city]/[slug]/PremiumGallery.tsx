"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import type { PremiumMediaView } from "@/lib/data";

// Galería del contenido premium de un plan al que el viewer ya está suscrito.
// Las imágenes/vídeos se sirven por el proxy autenticado /api/media/premium/:id.
export function PremiumGallery({ planId }: { planId: string }) {
  const [media, setMedia] = useState<PremiumMediaView[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/subscriptions/content/${planId}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { media: PremiumMediaView[] }) => active && setMedia(d.media))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [planId]);

  if (error) {
    return (
      <p className="text-xs text-muted-foreground">
        No se pudo cargar el contenido.
      </p>
    );
  }
  if (!media) {
    return <p className="text-xs text-muted-foreground">Cargando contenido…</p>;
  }
  if (media.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        El anunciante aún no ha subido contenido a este plan.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {media.map((m) =>
        m.type === "video" ? (
          <video
            key={m.id}
            src={`/api/media/premium/${m.id}`}
            controls
            preload="metadata"
            playsInline
            className="aspect-square w-full rounded-lg bg-black object-cover ring-1 ring-border"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={m.id}
            src={`/api/media/premium/${m.id}`}
            alt="Contenido exclusivo"
            loading="lazy"
            className="aspect-square w-full rounded-lg object-cover ring-1 ring-border"
          />
        ),
      )}
    </div>
  );
}
