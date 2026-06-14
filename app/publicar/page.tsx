import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PublishForm } from "./PublishForm";
import { getCountriesWithCities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Publicar perfil",
  description: "Crea tu perfil de citas y conoce gente verificada cerca de ti.",
  robots: { index: false, follow: true },
};

export default async function PublishPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/publicar");

  const countries = await getCountriesWithCities();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Publica tu perfil</h1>
        <p className="mt-2 text-muted-foreground">
          Rellena tus datos para que otras personas puedan conocerte.
        </p>
      </header>

      <div className="mt-8">
        <PublishForm countries={countries} />
      </div>
    </div>
  );
}
