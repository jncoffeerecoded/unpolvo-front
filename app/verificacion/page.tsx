import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verificación de identidad",
  robots: { index: false, follow: false },
};

// Verificación de perfil deshabilitada: la pantalla queda bloqueada.
export default function VerificationPage() {
  redirect("/");
}
