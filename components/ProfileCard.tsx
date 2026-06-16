import Link from "next/link";
import { Avatar } from "./Avatar";
import { Flag } from "./Flag";
import { Icon } from "./icons";
import { Stars } from "./Stars";
import { Badge } from "@/components/ui/badge";
import { profilePath } from "@/lib/seo";
import { getDict } from "@/lib/i18n";
import type { ProfileCardView } from "@/lib/data";

export function ProfileCard({
  p,
  locale = "es",
}: {
  p: ProfileCardView;
  locale?: string;
}) {
  const d = getDict(locale);
  const href = profilePath(p.countryCode, p.citySlug, p.slug);

  return (
    <Link
      href={href}
      className="group grid grid-cols-[40%_1fr] overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Avatar
          name={p.nickname}
          photoUrl={p.photoUrl}
          className="h-full w-full transition duration-300 group-hover:scale-105"
        />
        {p.featured && (
          <Badge className="absolute left-2 top-2 gap-1 bg-amber-400 text-amber-950 hover:bg-amber-400">
            <Icon name="star" filled className="h-3 w-3" />
            {d.ui.featured}
          </Badge>
        )}
        {p.isVerified && (
          <Badge
            title={d.ui.verifiedHint}
            className="absolute right-2 top-2 gap-1 bg-sky-500 text-white hover:bg-sky-500"
          >
            <Icon name="shield-check" className="h-3 w-3" />
          </Badge>
        )}
        <span className="absolute bottom-2 left-2">
          <Flag code={p.countryCode} className="h-4 w-6" />
        </span>
      </div>
      <div className="flex flex-col justify-center p-4">
        <h3 className="truncate text-lg font-semibold">
          {p.nickname}
          <span className="font-normal text-muted-foreground">, {p.age}</span>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Icon name="mapPin" className="h-3.5 w-3.5" />
          <span className="truncate">{p.cityName}</span>
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
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
      </div>
    </Link>
  );
}
