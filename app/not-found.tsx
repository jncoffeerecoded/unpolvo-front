import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="rounded-full bg-rose-50 p-4 text-rose-600">
        <Icon name="search" className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-zinc-900">
        No encontramos esta página
      </h1>
      <p className="mt-2 text-zinc-600">
        Puede que el perfil haya sido retirado o que la dirección no exista.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 font-medium text-white transition hover:bg-rose-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
