import Link from "next/link";
import { Icon } from "./icons";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm text-zinc-500"
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <Icon name="chevronRight" className="h-3.5 w-3.5 text-zinc-300" />
          )}
          {it.href ? (
            <Link href={it.href} className="hover:text-rose-600">
              {it.name}
            </Link>
          ) : (
            <span className="font-medium text-zinc-700">{it.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
