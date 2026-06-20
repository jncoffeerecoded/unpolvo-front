"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

async function getToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// ─── Suscriptor ────────────────────────────────────────────────
export async function subscribeToPlan(
  planId: string,
): Promise<ActionResult<{ conversationId: string; status: string }>> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Inicia sesión para suscribirte." };

  const { ok, body } = await apiSend(`/plans/${planId}/subscribe`, {
    method: "POST",
    token,
  });
  if (!ok) {
    return { ok: false, error: (body.error as string) ?? "No se pudo suscribir." };
  }
  return {
    ok: true,
    conversationId: body.conversationId as string,
    status: body.status as string,
  };
}

// ─── Anunciante: planes ────────────────────────────────────────
export async function createPlan(
  profileId: string,
  data: { name: string; description?: string; price: number; currency?: string },
): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "No autorizado." };
  const { ok, body } = await apiSend(`/me/profiles/${profileId}/plans`, {
    method: "POST",
    token,
    json: data,
  });
  if (!ok) return { ok: false, error: (body.error as string) ?? "No se pudo crear el plan." };
  return { ok: true };
}

export async function updatePlan(
  planId: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    currency: string;
    active: boolean;
  }>,
): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "No autorizado." };
  const { ok, body } = await apiSend(`/me/plans/${planId}`, {
    method: "PATCH",
    token,
    json: data,
  });
  if (!ok) return { ok: false, error: (body.error as string) ?? "No se pudo actualizar." };
  return { ok: true };
}

export async function deletePlan(planId: string): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "No autorizado." };
  const { ok, body } = await apiSend(`/me/plans/${planId}`, {
    method: "DELETE",
    token,
  });
  if (!ok) return { ok: false, error: (body.error as string) ?? "No se pudo eliminar." };
  return { ok: true };
}

export async function deleteMedia(mediaId: string): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "No autorizado." };
  const { ok, body } = await apiSend(`/me/media/${mediaId}`, {
    method: "DELETE",
    token,
  });
  if (!ok) return { ok: false, error: (body.error as string) ?? "No se pudo eliminar." };
  return { ok: true };
}

// ─── Anunciante: decidir suscripciones ─────────────────────────
export async function decideSubscriber(
  subscriptionId: string,
  approve: boolean,
  manageSlug?: string,
): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "No autorizado." };
  const path = approve
    ? `/me/subscriptions/${subscriptionId}/approve`
    : `/me/subscriptions/${subscriptionId}/reject`;
  const { ok, body } = await apiSend(path, { method: "POST", token });
  if (!ok) return { ok: false, error: (body.error as string) ?? "No se pudo procesar." };
  if (manageSlug) revalidatePath(`/cuenta/${manageSlug}/suscripciones`);
  return { ok: true };
}
