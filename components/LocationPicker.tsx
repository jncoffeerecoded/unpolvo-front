"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export function LocationPicker({
  countries,
  current,
}: {
  countries: { code: string; name: string }[];
  current?: string;
}) {
  const router = useRouter();

  function onChange(code: string) {
    document.cookie = `loc=${code}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm">
      <Icon name="mapPin" className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">Ubicación:</span>
      <select
        value={current ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-medium outline-none"
      >
        <option value="">Todos los países</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
