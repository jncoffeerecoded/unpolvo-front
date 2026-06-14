import Link from "next/link";
import { Icon } from "./icons";
import { SITE_NAME } from "@/lib/seo";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="flex items-center gap-2 text-base font-bold text-foreground">
              <span className="text-primary">
                <Icon name="heart" filled className="h-5 w-5" />
              </span>
              {SITE_NAME}
            </p>
            <p className="mt-2">Conoce gente verificada cerca de ti.</p>
          </div>
          <div className="flex gap-12">
            <ul className="space-y-2">
              <li className="font-medium text-foreground">Explorar</li>
              <li>
                <Link href="/" className="hover:text-primary">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/publicar" className="hover:text-primary">
                  Publicar perfil
                </Link>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center gap-1 font-medium text-foreground">
                <Icon name="shield-check" className="h-4 w-4" /> Seguridad
              </li>
              <li>Identidad verificada por KYC</li>
              <li>Solo mayores de 18</li>
            </ul>
            <ul className="space-y-2">
              <li className="font-medium text-foreground">Legal</li>
              <li>
                <Link href="/terminos" className="hover:text-primary">
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-primary">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t pt-6 text-xs">
          © {new Date().getFullYear()} {SITE_NAME}. Plataforma exclusiva para
          personas mayores de 18 años. Las personas publican sus propios
          perfiles.
        </p>
      </div>
    </footer>
  );
}
