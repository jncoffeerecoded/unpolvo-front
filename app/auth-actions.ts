"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

export type AuthState = { error?: string };

function safeNext(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  // Solo rutas internas, para evitar open-redirect.
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
    throw error; // re-lanza el redirect de Next
  }
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre"),
  email: z.string().trim().email("Email no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function registerUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Ese email ya está registrado." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });

  await signIn("credentials", { email, password, redirectTo: "/cuenta" });
  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
