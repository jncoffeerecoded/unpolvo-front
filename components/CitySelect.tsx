"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export function CitySelect({
  country,
  cities,
}: {
  country: string;
  cities: { slug: string; name: string }[];
}) {
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm">
      <Icon name="mapPin" className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">Ciudad:</span>
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) router.push(`/${country}/${e.target.value}`);
        }}
        className="max-w-[12rem] bg-transparent font-medium outline-none"
      >
        <option value="" disabled>
          Selecciona una ciudad
        </option>
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
