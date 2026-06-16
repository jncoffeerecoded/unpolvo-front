import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon } from "@/components/icons";
import { Stars } from "@/components/Stars";
import { ProfileCard } from "@/components/ProfileCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProfileGallery } from "@/components/ProfileGallery";
import { ProfileSocial } from "./ProfileSocial";
import { Comments } from "./Comments";
import { getProfileBySlug, getRelated, getInteraction } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildTitle,
  cityPath,
  countryPath,
  jsonLdString,
  profileJsonLd,
  profilePath,
  SITE_NAME,
} from "@/lib/seo";

export const revalidate = 120;

type Props = {
  params: Promise<{ country: string; city: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProfileBySlug(slug);
  if (!p) return {};
  const canonical = absoluteUrl(profilePath(p.countryCode, p.citySlug, p.slug));
  const description = p.bio.slice(0, 155);
  return {
    title: `${p.nickname}, ${p.age} — ${p.cityName}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: buildTitle([`${p.nickname}, ${p.age}`, p.cityName]),
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "profile",
      ...(p.photoUrl ? { images: [{ url: p.photoUrl }] } : {}),
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { country, city, slug } = await params;
  const p = await getProfileBySlug(slug);
  if (!p) notFound();

  if (p.countryCode !== country || p.citySlug !== city) {
    redirect(profilePath(p.countryCode, p.citySlug, p.slug));
  }

  const d = getDict("es");
  const path = profilePath(p.countryCode, p.citySlug, p.slug);
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;
  const isOwner = !!currentUserId && currentUserId === p.ownerId;
  const interaction = session?.accessToken
    ? await getInteraction(p.id, session.accessToken)
    : { liked: false, myRating: null };
  const related = await getRelated(p.slug);

  const ld = profileJsonLd({
    name: `${p.nickname}, ${p.age}`,
    description: p.bio,
    url: absoluteUrl(path),
    image: p.photoUrl ?? undefined,
    gender: p.gender,
    city: p.cityName,
    country: p.countryName,
  });
  const crumbs = breadcrumbJsonLd([
    { name: d.ui.home, path: "/" },
    { name: p.countryName, path: countryPath(p.countryCode) },
    { name: p.cityName, path: cityPath(p.countryCode, p.citySlug) },
    { name: p.nickname, path },
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(ld) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(crumbs) }}
      />

      <Breadcrumbs
        items={[
          { name: d.ui.home, href: "/" },
          { name: p.countryName, href: countryPath(p.countryCode) },
          { name: p.cityName, href: cityPath(p.countryCode, p.citySlug) },
          { name: p.nickname },
        ]}
      />

      <div className="mt-4 grid gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
        {/* Columna principal */}
        <div>
          <ProfileGallery
            photos={p.photos}
            name={p.nickname}
            verified={p.isVerified}
            verifiedLabel={d.ui.verified}
          />

          <h1 className="mt-5 text-3xl font-bold">{p.title}</h1>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Icon name="mapPin" className="h-4 w-4" /> {p.cityName}, {p.countryName}
          </p>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">{d.ui.about}</h2>
            <p className="mt-2 whitespace-pre-line text-foreground/90">{p.bio}</p>
          </section>

          {/* Comentarios */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">
              {d.ui.comments} ({p.commentsCount})
            </h2>
            <div className="mt-4">
              <Comments
                profileId={p.id}
                path={path}
                comments={p.comments}
                currentUserId={currentUserId}
                ownerId={p.ownerId}
                isLoggedIn={!!session?.user}
              />
            </div>
          </section>
        </div>

        {/* Columna lateral */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold">
                {p.nickname}, {p.age}
              </h2>
              {p.isVerified && (
                <Icon name="shield-check" className="h-5 w-5 text-sky-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{d.gender[p.gender]}</p>

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="calendar" className="h-4 w-4" /> {d.ui.age}
                </dt>
                <dd className="font-medium">
                  {p.age} {d.ui.years}
                </dd>
              </div>
              {p.bodyType && (
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="buildAverage" className="h-4 w-4" /> {d.ui.bodyType}
                  </dt>
                  <dd className="font-medium">
                    {d.bodyType[p.bodyType] ?? p.bodyType}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="star" className="h-4 w-4" /> Valoración
                </dt>
                <dd className="flex items-center gap-1 font-medium">
                  <Stars value={p.ratingAvg} /> {p.ratingAvg.toFixed(1)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t pt-5">
              <ProfileSocial
                profileId={p.id}
                path={path}
                isLoggedIn={!!session?.user}
                isOwner={isOwner}
                initialLiked={interaction.liked}
                initialMyRating={interaction.myRating}
                likesCount={p.likesCount}
                ratingAvg={p.ratingAvg}
                ratingCount={p.ratingCount}
              />
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold">{d.ui.recentProfiles}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((rp) => (
              <ProfileCard key={rp.slug} p={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
