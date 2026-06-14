"use server";

// Inicio de la verificación de identidad.
//
// En producción se integra un proveedor KYC (Stripe Identity, Veriff, Onfido).
// El flujo: se crea una sesión de verificación en el proveedor y se redirige
// al usuario a su URL segura. El proveedor compara selfie + documento en SU
// infraestructura y nos devuelve SOLO el resultado por webhook.
// Nosotros NUNCA almacenamos la biometría ni la imagen del documento.

export type VerifyResult = { url?: string; message?: string };

export async function startVerification(): Promise<VerifyResult> {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    return {
      message:
        "Entorno de demo: configura STRIPE_SECRET_KEY en .env para activar la verificación real. No se procesa ninguna biometría en este modo.",
    };
  }

  // ── Producción (ejemplo con Stripe Identity) ──────────────────
  // import Stripe from "stripe";
  // const stripe = new Stripe(secret);
  // const session = await stripe.identity.verificationSessions.create({
  //   type: "document",
  //   options: { document: { require_matching_selfie: true } },
  //   return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/verificacion/ok`,
  // });
  // return { url: session.url ?? undefined };

  return {
    message:
      "Stripe configurado. Añade el SDK `stripe` y descomenta el bloque de creación de sesión para redirigir al flujo seguro.",
  };
}
