import { Icon } from "./icons";

export function Stars({
  value,
  className = "h-3.5 w-3.5",
}: {
  value: number;
  className?: string;
}) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          filled={i <= full}
          className={`${className} ${i <= full ? "text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </span>
  );
}
