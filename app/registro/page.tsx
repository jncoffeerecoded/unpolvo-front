import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/AuthForm";
import { Icon } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/cuenta");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <span className="mx-auto text-primary">
            <Icon name="sparkles" className="h-8 w-8" />
          </span>
          <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
          <CardDescription>
            Regístrate para publicar tu perfil y gestionar tus anuncios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="register" next="/cuenta" />
        </CardContent>
      </Card>
    </div>
  );
}
