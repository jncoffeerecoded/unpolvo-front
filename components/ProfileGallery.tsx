"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";

type Photo = { url: string; alt: string | null };

export function ProfileGallery({
  photos,
  name,
  verified,
  verifiedLabel = "Verificado",
}: {
  photos: Photo[];
  name: string;
  verified?: boolean;
  verifiedLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const has = photos.length > 0;
  const current = photos[active];

  const prev = useCallback(
    () => setActive((i) => (i - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setActive((i) => (i + 1) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, prev, next]);

  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      {/* Imagen principal: ajustada a la card y completa (object-contain) */}
      <div className="relative aspect-[4/3] bg-muted sm:aspect-[16/10]">
        {has ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block h-full w-full cursor-zoom-in"
            aria-label="Ver imagen completa"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.alt ?? name}
              className="h-full w-full object-contain"
            />
          </button>
        ) : (
          <Avatar name={name} className="h-full w-full" />
        )}

        {verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-sky-500 px-3 py-1 text-sm font-semibold text-white shadow">
            <Icon name="shield-check" className="h-4 w-4" /> {verifiedLabel}
          </span>
        )}

        {has && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:bg-black/75"
          >
            <Icon name="expand" className="h-4 w-4" /> Ver imagen completa
          </button>
        )}
      </div>

      {/* Miniaturas: clic para cambiar; la activa se resalta */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {photos.map((ph, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1}`}
              aria-current={i === active}
              className={`h-20 w-20 flex-none overflow-hidden rounded-xl ring-2 transition ${
                i === active
                  ? "ring-primary"
                  : "ring-transparent hover:ring-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ph.url}
                alt={ph.alt ?? `${name} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox para agrandar */}
      {open && has && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <Icon name="x" className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Anterior"
                className="absolute left-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <Icon name="chevronRight" className="h-6 w-6 rotate-180" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Siguiente"
                className="absolute right-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <Icon name="chevronRight" className="h-6 w-6" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.alt ?? name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] object-contain"
          />

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {active + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}
