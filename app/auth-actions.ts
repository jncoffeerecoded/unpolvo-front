"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { apiSend } from "@/lib/api";

export type AuthState = { error?: string };

function safeNext(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/cuenta";
}

export async function loginWithCredentials(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const next = safeNext(formData.get("next"));
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: next,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function registerUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // El backend valida y crea el usuario.
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

  await signIn("credentials", { email, password, redirectTo: "/cuenta" });
  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
