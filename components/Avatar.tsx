// Avatar con foto o, en su defecto, degradado determinista a partir del nombre.

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function Avatar({
  name,
  photoUrl,
  className = "",
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt={name} className={`object-cover ${className}`} />
    );
  }
  const hue = hashHue(name || "?");
  return (
    <div
      className={`flex items-center justify-center font-semibold text-white ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 65% 55%), hsl(${(hue + 45) % 360} 60% 42%))`,
      }}
    >
      <span className="text-4xl drop-shadow-sm">
        {(name.trim().charAt(0) || "?").toUpperCase()}
      </span>
    </div>
  );
}
