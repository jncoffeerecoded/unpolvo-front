import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Política de privacidad de ${SITE_NAME}. Solo recopilamos datos necesarios para la publicación.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        <Icon name="shield-check" className="h-4 w-4" /> Privacidad
      </span>
      <h1 className="mt-4 text-3xl font-bold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: 14 de junio de 2026
      </p>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <strong className="text-foreground">En resumen:</strong> solo recopilamos
        información de carácter <strong>necesario para la publicación del
        anuncio</strong> y para gestionar tu cuenta. Al aceptar estas condiciones
        confirmas además que eres <strong>mayor de edad</strong>.
      </div>

      <div className="mt-8 space-y-6 text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Qué datos recopilamos
          </h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <strong>Datos del anuncio</strong> que tú aportas: apodo,
              descripción, edad, género, complexión, ubicación (país y ciudad) y
              fotos.
            </li>
            <li>
              <strong>Datos de cuenta</strong>: tu correo electrónico (y nombre si
              inicias sesión con Google) para autenticarte.
            </li>
            <li>
              <strong>Verificación</strong>: solo el <em>resultado</em>{" "}
              (verificado/no) que nos devuelve un proveedor externo. No
              almacenamos tu documento ni datos biométricos.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Finalidad</h2>
          <p className="mt-1">
            Usamos esos datos únicamente para <strong>mostrar tu anuncio</strong>,
            permitir interacciones (likes, valoraciones, comentarios) y gestionar
            tu cuenta. <strong>No vendemos tus datos</strong> a terceros.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. Conservación
          </h2>
          <p className="mt-1">
            Conservamos tu información mientras tu cuenta y tus anuncios estén
            activos. Puedes solicitar la eliminación de tu perfil y tus datos en
            cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Tus derechos
          </h2>
          <p className="mt-1">
            Puedes acceder, rectificar o eliminar tus datos, y retirar tu
            consentimiento. Las fotos que subes se almacenan en nuestro
            proveedor de almacenamiento para poder mostrarlas en tu anuncio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Edad</h2>
          <p className="mt-1">
            El servicio es solo para mayores de 18 años. Al aceptar estas
            condiciones <strong>confirmas que eres mayor de edad</strong>.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Consulta también los{" "}
        <Link href="/terminos" className="font-medium text-primary underline">
          Términos y políticas de uso
        </Link>
        .
      </p>
    </div>
  );
}
