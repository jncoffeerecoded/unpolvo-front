"use server";

import { signOut } from "@/auth";
import { apiSend } from "@/lib/api";

export type AuthState = { error?: string };

// Solo crea el usuario en el backend. El inicio de sesión se hace en el cliente
// (signIn de next-auth/react) para que la sesión y el navbar se actualicen sin recargar.
export async function registerAccount(formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { ok, body } = await apiSend("/auth/register", {
    method: "POST",
    json: { name, email, password },
  });
  if (!ok) {
    const fe = body.fieldErrors as Record<string, string> | undefined;
    return {
      error: fe
        ? Object.values(fe)[0]
        : ((body.error as string) ?? "No se pudo registrar."),
    };
  }
  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
