import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/icons";
import { VerifyButton } from "./VerifyButton";

export const metadata: Metadata = {
  title: "Verificación de identidad",
  description:
    "Verifica tu identidad con un proveedor externo para obtener la insignia de confianza. No almacenamos biometría.",
  robots: { index: false, follow: true },
};

const STEPS = [
  {
    icon: "scanFace",
    title: "Selfie + documento",
    text: "El proveedor compara una selfie con tu documento oficial en su propia plataforma segura.",
  },
  {
    icon: "shield-check",
    title: "Resultado por webhook",
    text: "Solo recibimos si la verificación fue correcta. Ni la imagen ni la biometría llegan a nuestros servidores.",
  },
  {
    icon: "check",
    title: "Insignia de confianza",
    text: "Tu perfil muestra la insignia azul de verificado, generando más confianza.",
  },
];

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/verificacion");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          <Icon name="shield-check" className="h-4 w-4" /> Seguridad
        </span>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">
          Verificación de identidad
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600">
          La verificación se realiza con un proveedor especializado (Stripe
          Identity, Veriff u Onfido). Tu privacidad está protegida: nunca
          guardamos tu documento ni tus datos biométricos.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <span className="inline-flex rounded-full bg-sky-50 p-3 text-sky-600">
              <Icon name={s.icon} className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-zinc-900">{s.title}</h2>
            <p className="mt-1 text-sm text-zinc-600">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <p className="text-zinc-700">
          ¿List@ para verificarte? El proceso tarda menos de 2 minutos.
        </p>
        <VerifyButton />
      </div>

      <p className="mt-6 text-center text-xs text-zinc-400">
        Cumplimiento: el tratamiento de datos biométricos está regulado (GDPR,
        BIPA…). Delegarlo en un proveedor certificado reduce tu responsabilidad
        y protege a las personas usuarias.
      </p>
    </div>
  );
}
