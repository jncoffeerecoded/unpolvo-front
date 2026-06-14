"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Páginas legales accesibles sin pasar la puerta de edad (para poder leerlas).
const ALLOWED = ["/terminos", "/privacidad"];

export function AgeGate() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    setMounted(true);
    setOk(localStorage.getItem("ageok") === "1");
  }, []);

  if (!mounted || ok) return null;
  if (ALLOWED.some((p) => pathname.startsWith(p))) return null;

  function accept() {
    localStorage.setItem("ageok", "1");
    setOk(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/85 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-lg font-bold text-rose-600">
          +18
        </span>
        <h2 className="text-xl font-bold text-zinc-900">
          Contenido solo para mayores de 18
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Este sitio contiene perfiles de citas y es exclusivo para personas
          mayores de edad.
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Al continuar confirmas que <strong>eres mayor de 18 años</strong> y que
          aceptas nuestros{" "}
          <Link href="/terminos" className="font-medium text-rose-600 underline">
            Términos de uso
          </Link>{" "}
          y la{" "}
          <Link
            href="/privacidad"
            className="font-medium text-rose-600 underline"
          >
            Política de privacidad
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={accept}
            className="rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white transition hover:bg-rose-700"
          >
            Acepto y soy mayor de 18 años
          </button>
          <a
            href="https://www.google.com"
            className="rounded-full px-4 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-100"
          >
            Salir
          </a>
        </div>
      </div>
    </div>
  );
}
