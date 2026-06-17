"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

async function getToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken;
}

export type StartChatResult =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

// Primer contacto desde la ficha del anuncio.
export async function startChat(
  profileId: string,
  body: string,
): Promise<StartChatResult> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Inicia sesión para enviar un mensaje." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Escribe un mensaje." };

  const { ok, body: res } = await apiSend(`/profiles/${profileId}/chat`, {
    method: "POST",
    token,
    json: { body: text },
  });
  if (!ok) {
    return { ok: false, error: (res.error as string) ?? "No se pudo enviar el mensaje." };
  }
  return { ok: true, conversationId: res.conversationId as string };
}

export type SendState = { error?: string; ok?: boolean };

// Envío dentro de una conversación abierta.
export async function sendMessage(
  _prev: SendState,
  formData: FormData,
): Promise<SendState> {
  const token = await getToken();
  if (!token) return { error: "Inicia sesión para escribir." };

  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Escribe un mensaje." };

  const { ok, body: res } = await apiSend(
    `/chat/conversations/${conversationId}/messages`,
    { method: "POST", token, json: { body } },
  );
  if (!ok) {
    return { error: (res.error as string) ?? "No se pudo enviar el mensaje." };
  }
  revalidatePath(`/mensajes/${conversationId}`);
  return { ok: true };
}
