import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Términos y políticas de uso",
  description: `Términos y políticas de uso de ${SITE_NAME}. Plataforma de anuncios de citas solo para mayores de 18 años.`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        <Icon name="shield-check" className="h-4 w-4" /> Legal
      </span>
      <h1 className="mt-4 text-3xl font-bold">Términos y políticas de uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: 14 de junio de 2026
      </p>

      <div className="mt-8 space-y-6 text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Objeto</h2>
          <p className="mt-1">
            {SITE_NAME} es una plataforma de <strong>anuncios de citas</strong>{" "}
            donde cada persona publica su propio perfil para conocer gente. El
            uso del sitio implica la aceptación de estos términos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. Mayoría de edad
          </h2>
          <p className="mt-1">
            El sitio es <strong>exclusivo para personas mayores de 18 años</strong>.
            Al aceptar estas condiciones <strong>confirmas que eres mayor de
            edad</strong>. Nos reservamos el derecho de solicitar verificación de
            identidad y de retirar cualquier cuenta que no cumpla este requisito.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. Contenido del usuario
          </h2>
          <p className="mt-1">
            Cada persona es responsable del contenido que publica (textos y
            fotos) y declara tener los derechos sobre el mismo. Está prohibido
            publicar contenido ilegal, de terceros sin consentimiento, o que
            implique a menores. Podemos moderar o retirar contenido que incumpla
            estas normas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Conducta e interacciones
          </h2>
          <p className="mt-1">
            Cada usuario puede valorar, dar like y comentar{" "}
            <strong>una sola vez</strong> los anuncios de otras personas (no los
            propios). El propietario de un anuncio puede responder y moderar los
            comentarios de su publicación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. Verificación de identidad
          </h2>
          <p className="mt-1">
            La verificación se realiza a través de un proveedor externo
            especializado. <strong>No almacenamos datos biométricos</strong> ni
            tu documento: solo recibimos el resultado de la verificación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Datos personales
          </h2>
          <p className="mt-1">
            Solo recopilamos la información de carácter{" "}
            <strong>necesario para la publicación del anuncio</strong> y la
            gestión de tu cuenta. Consulta la{" "}
            <Link href="/privacidad" className="font-medium text-primary underline">
              Política de privacidad
            </Link>{" "}
            para más detalle.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        ¿Dudas? Vuelve al{" "}
        <Link href="/" className="font-medium text-primary underline">
          inicio
        </Link>
        .
      </p>
    </div>
  );
}
