"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

export type CommentState = { error?: string; ok?: boolean };

async function getToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const token = await getToken();
  if (!token) return { error: "Inicia sesión para comentar." };

  const profileId = String(formData.get("profileId") ?? "");
  const path = String(formData.get("path") ?? "");
  const body = String(formData.get("body") ?? "");
  const parentId = (formData.get("parentId") as string) || undefined;

  const { ok, body: res } = await apiSend(`/profiles/${profileId}/comments`, {
    method: "POST",
    token,
    json: { body, parentId },
  });
  if (!ok) {
    const fe = res.fieldErrors as Record<string, string> | undefined;
    return {
      error: fe ? Object.values(fe)[0] : ((res.error as string) ?? "No se pudo comentar."),
    };
  }
  revalidatePath(path);
  return { ok: true };
}

export async function deleteComment(commentId: string, path: string) {
  const token = await getToken();
  if (!token) return { error: "login" };
  const { ok, body } = await apiSend(`/comments/${commentId}`, {
    method: "DELETE",
    token,
  });
  if (ok) revalidatePath(path);
  return ok ? { ok: true } : { error: (body.error as string) ?? "Error" };
}

export async function toggleLike(profileId: string, path: string) {
  const token = await getToken();
  if (!token) return { error: "login" };
  const { ok, body } = await apiSend(`/profiles/${profileId}/like`, {
    method: "POST",
    token,
  });
  if (ok) revalidatePath(path);
  return ok ? { liked: body.liked as boolean } : { error: (body.error as string) ?? "Error" };
}

export async function rateProfile(profileId: string, value: number, path: string) {
  const token = await getToken();
  if (!token) return { error: "login" };
  const { ok, body } = await apiSend(`/profiles/${profileId}/rating`, {
    method: "PUT",
    token,
    json: { value },
  });
  if (ok) revalidatePath(path);
  return ok ? { myRating: body.myRating as number } : { error: (body.error as string) ?? "Error" };
}
