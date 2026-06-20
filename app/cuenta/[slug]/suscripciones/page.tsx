import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/icons";
import {
  getMyProfiles,
  getProfilePlansAdmin,
  getSubscribers,
} from "@/lib/data";
import { PlansManager } from "./PlansManager";
import { SubscribersList } from "./SubscribersList";

export const metadata: Metadata = {
  title: "Administrar suscripciones",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ManageSubscriptionsPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.accessToken) {
    redirect(`/login?next=/cuenta/${slug}/suscripciones`);
  }

  const profiles = await getMyProfiles(session.accessToken);
  const profile = profiles.find((p) => p.slug === slug);
  if (!profile) notFound();

  const [plans, subscribers] = await Promise.all([
    getProfilePlansAdmin(profile.id, session.accessToken),
    getSubscribers(profile.id, session.accessToken),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/cuenta"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
        Mis anuncios
      </Link>

      <h1 className="mt-3 text-3xl font-bold">Administrar suscripciones</h1>
      <p className="text-muted-foreground">
        {profile.title} · {profile.cityName}
      </p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Icon name="crown" className="h-5 w-5 text-amber-500" />
          Planes y contenido
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea planes con distintos precios y asigna a cada uno un paquete de fotos y
          vídeos. Solo los suscriptores aprobados podrán verlo.
        </p>
        <div className="mt-4">
          <PlansManager profileId={profile.id} slug={slug} initialPlans={plans} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Icon name="user" className="h-5 w-5" />
          Suscriptores
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aprueba o rechaza las solicitudes. Revisa los recaudos en el chat con cada
          suscriptor.
        </p>
        <div className="mt-4">
          <SubscribersList slug={slug} initialSubscribers={subscribers} />
        </div>
      </section>
    </div>
  );
}
