"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { rateProfile, toggleLike } from "./actions";

type Props = {
  profileId: string;
  path: string;
  isLoggedIn: boolean;
  isOwner: boolean;
  initialLiked: boolean;
  initialMyRating: number | null;
  likesCount: number;
  ratingAvg: number;
  ratingCount: number;
};

export function ProfileSocial({
  profileId,
  path,
  isLoggedIn,
  isOwner,
  initialLiked,
  initialMyRating,
  likesCount,
  ratingAvg,
  ratingCount,
}: Props) {
  const router = useRouter();
  const [, start] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(likesCount);
  const [myRating, setMyRating] = useState<number | null>(initialMyRating);
  const [hover, setHover] = useState(0);

  function goLogin() {
    router.push(`/login?next=${encodeURIComponent(path)}`);
  }

  function onLike() {
    if (!isLoggedIn) return goLogin();
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    start(async () => {
      await toggleLike(profileId, path);
      router.refresh();
    });
  }

  function onRate(v: number) {
    if (!isLoggedIn) return goLogin();
    setMyRating(v);
    start(async () => {
      await rateProfile(profileId, v, path);
      router.refresh();
    });
  }

  const shown = hover || myRating || 0;

  return (
    <div className="space-y-4">
      {/* Resumen (siempre visible) */}
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="heart" className="h-4 w-4" />
          <span className="font-medium">{likes}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Icon name="star" filled className="h-4 w-4 text-amber-400" />
          <span className="font-medium text-foreground">
            {ratingAvg.toFixed(1)}
          </span>
          ({ratingCount})
        </span>
      </div>

      {isOwner ? (
        <p className="rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Es tu anuncio: no puedes valorarlo ni darle like.
        </p>
      ) : (
        <>
          <Button
            type="button"
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={onLike}
          >
            <Icon name="heart" filled={liked} className="h-4 w-4" />
            {liked ? "Te gusta" : "Me gusta"}
          </Button>

          <div>
            <p className="text-sm font-medium">Tu valoración</p>
            <div className="mt-1 flex gap-0.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onRate(v)}
                  onMouseEnter={() => setHover(v)}
                  aria-label={`${v} estrellas`}
                  className="p-0.5"
                >
                  <Icon
                    name="star"
                    filled={v <= shown}
                    className={`h-6 w-6 ${v <= shown ? "text-amber-400" : "text-muted-foreground/30"}`}
                  />
                </button>
              ))}
            </div>
            {!isLoggedIn && (
              <p className="mt-1 text-xs text-muted-foreground">
                Inicia sesión para valorar.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
