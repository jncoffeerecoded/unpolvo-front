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
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const session = await auth();
  if (session?.user) redirect(next || "/cuenta");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <span className="mx-auto text-primary">
            <Icon name="heart" className="h-8 w-8" strokeWidth={2} />
          </span>
          <CardTitle className="text-2xl">Inicia sesión</CardTitle>
          <CardDescription>
            Accede para publicar y gestionar tus anuncios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" next={next ?? "/cuenta"} />
        </CardContent>
      </Card>
    </div>
  );
}
