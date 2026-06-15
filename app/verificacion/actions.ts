"use server";

import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

export type VerifyResult = { url?: string; message?: string };

export async function startVerification(): Promise<VerifyResult> {
  const session = await auth();
  if (!session?.accessToken) {
    return { message: "Inicia sesión para verificar tu identidad." };
  }
  const { ok, body } = await apiSend("/verification/start", {
    method: "POST",
    token: session.accessToken,
  });
  if (!ok) {
    return { message: (body.error as string) ?? "No se pudo iniciar la verificación." };
  }
  return {
    url: body.url as string | undefined,
    message: body.message as string | undefined,
  };
}
