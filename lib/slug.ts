// Generación de slugs amigables para URLs SEO.

export function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // quita acentos/diacríticos
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "perfil"
  );
}

export function randomSuffix(length = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// Slug único combinando el texto base con un sufijo aleatorio corto.
export function uniqueSlug(base: string): string {
  return `${slugify(base)}-${randomSuffix()}`;
}
