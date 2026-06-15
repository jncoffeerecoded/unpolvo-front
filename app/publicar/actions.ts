"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

export type CreateState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const FIELDS = [
  "title",
  "nickname",
  "bio",
  "age",
  "gender",
  "countryCode",
  "citySlug",
  "bodyType",
];

export async function createProfile(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const session = await auth();
  const token = session?.accessToken;
  if (!token) return { error: "Debes iniciar sesión para publicar." };

  // Reenvía los campos + fotos al backend como multipart.
  const fd = new FormData();
  for (const key of FIELDS) {
    const v = formData.get(key);
    if (v != null && v !== "") fd.append(key, v as string);
  }
  if (formData.get("featured")) fd.append("featured", "true");
  for (const file of formData.getAll("photoFiles")) {
    if (file instanceof File && file.size > 0) fd.append("photos", file);
  }

  const { ok, body } = await apiSend("/profiles", {
    method: "POST",
    token,
    form: fd,
  });
  if (!ok) {
    return {
      error: (body.error as string) ?? "No se pudo publicar.",
      fieldErrors: body.fieldErrors as Record<string, string> | undefined,
    };
  }

  revalidatePath("/sitemap.xml");
  redirect(body.path as string);
}
