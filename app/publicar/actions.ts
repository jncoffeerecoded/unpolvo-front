"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { GENDERS, BODY_TYPES } from "@/lib/attributes";
import { profilePath } from "@/lib/seo";
import { auth } from "@/auth";
import {
  uploadImage,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/storage";

const emptyToUndef = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const schema = z.object({
  title: z.string().trim().min(5, "Mínimo 5 caracteres").max(80),
  nickname: z.string().trim().min(2, "Mínimo 2 caracteres").max(40),
  bio: z
    .string()
    .trim()
    .min(20, "Cuéntanos un poco más sobre ti (mín. 20 caracteres)")
    .max(2000),
  age: z.coerce
    .number()
    .int()
    .min(18, "Debes ser mayor de 18 años")
    .max(99, "Edad no válida"),
  gender: z.enum(GENDERS),
  countryCode: z.string().min(2, "Selecciona un país"),
  citySlug: z.string().min(1, "Selecciona una ciudad"),
  bodyType: z.preprocess(emptyToUndef, z.enum(BODY_TYPES).optional()),
  featured: z.boolean().default(false),
});

export type CreateState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createProfile(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para publicar." };
  }

  const parsed = schema.safeParse({
    title: formData.get("title"),
    nickname: formData.get("nickname"),
    bio: formData.get("bio"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    countryCode: formData.get("countryCode"),
    citySlug: formData.get("citySlug"),
    bodyType: formData.get("bodyType"),
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: "Revisa los campos marcados.", fieldErrors };
  }
  const data = parsed.data;

  const city = await prisma.city.findFirst({
    where: { slug: data.citySlug, country: { code: data.countryCode } },
    include: { country: true },
  });
  if (!city) return { error: "Selecciona un país y una ciudad válidos." };

  // Subida de fotos (a bucket de Railway en prod, /public/uploads en dev).
  const rawFiles = formData.getAll("photoFiles");
  const files = rawFiles
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 6);
  const photoUrls: string[] = [];
  try {
    for (const f of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
        return { error: "Formato de imagen no válido (usa JPG, PNG, WEBP o AVIF)." };
      }
      if (f.size > MAX_IMAGE_BYTES) {
        return { error: "Cada foto debe pesar menos de 5 MB." };
      }
      photoUrls.push(await uploadImage(f));
    }
  } catch {
    return {
      error: "No se pudo procesar o subir alguna de las fotos. Inténtalo de nuevo.",
    };
  }

  const slug = uniqueSlug(`${data.nickname}-${city.slug}`);
  await prisma.profile.create({
    data: {
      slug,
      title: data.title,
      nickname: data.nickname,
      bio: data.bio,
      age: data.age,
      gender: data.gender,
      userId: session.user.id,
      countryId: city.countryId,
      cityId: city.id,
      bodyType: data.bodyType ?? null,
      // En producción entraría como "pending" hasta moderación.
      status: "active",
      featuredUntil: data.featured
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null,
      photos: photoUrls.length
        ? {
            create: photoUrls.map((url, i) => ({
              url,
              order: i,
              isPrimary: i === 0,
            })),
          }
        : undefined,
    },
  });

  // Refresca el sitemap de inmediato para que el nuevo perfil sea indexable.
  revalidatePath("/sitemap.xml");

  redirect(profilePath(city.country.code, city.slug, slug));
}
