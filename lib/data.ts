import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// ─── View models ───────────────────────────────────────────────
export type ProfileCardView = {
  slug: string;
  title: string;
  nickname: string;
  age: number;
  gender: string;
  bodyType: string | null;
  isVerified: boolean;
  featured: boolean;
  photoUrl: string | null;
  countryCode: string;
  citySlug: string;
  cityName: string;
  commentsCount: number;
  likesCount: number;
  ratingCount: number;
  ratingAvg: number;
};

export type CommentView = {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string;
  authorImage: string | null;
  authorId: string;
  replies: CommentView[];
};

export type ProfileView = ProfileCardView & {
  id: string;
  ownerId: string | null;
  bio: string;
  countryName: string;
  photos: { url: string; alt: string | null }[];
  comments: CommentView[];
  createdAt: Date;
};

const isFeatured = (d: Date | null) => !!d && d.getTime() > Date.now();
const avg = (sum: number, count: number) => (count > 0 ? sum / count : 0);

// ─── Países / ciudades ─────────────────────────────────────────
export function getCountries() {
  return prisma.country.findMany({
    orderBy: { name: "asc" },
    include: {
      cities: { orderBy: { name: "asc" }, take: 6 },
      _count: { select: { profiles: true, cities: true } },
    },
  });
}

export const getCountry = cache((code: string) =>
  prisma.country.findUnique({
    where: { code },
    include: {
      _count: { select: { profiles: true } },
      cities: {
        orderBy: { name: "asc" },
        include: { _count: { select: { profiles: true } } },
      },
    },
  }),
);

export const getCity = cache((countryCode: string, citySlug: string) =>
  prisma.city.findFirst({
    where: { slug: citySlug, country: { code: countryCode } },
    include: { country: true },
  }),
);

export async function getCountriesWithCities() {
  const rows = await prisma.country.findMany({
    orderBy: { name: "asc" },
    include: { cities: { orderBy: { name: "asc" } } },
  });
  return rows.map((c) => ({
    code: c.code,
    name: c.name,
    cities: c.cities.map((ci) => ({ slug: ci.slug, name: ci.name })),
  }));
}

// ─── Listados ──────────────────────────────────────────────────
const CARD_INCLUDE = {
  photos: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 },
  city: true,
  country: true,
} satisfies Prisma.ProfileInclude;

type CardRow = {
  slug: string;
  title: string;
  nickname: string;
  age: number;
  gender: string;
  bodyType: string | null;
  isVerified: boolean;
  featuredUntil: Date | null;
  commentsCount: number;
  likesCount: number;
  ratingSum: number;
  ratingCount: number;
  photos: { url: string }[];
  city: { slug: string; name: string };
  country: { code: string };
};

function toCard(p: CardRow): ProfileCardView {
  return {
    slug: p.slug,
    title: p.title,
    nickname: p.nickname,
    age: p.age,
    gender: p.gender,
    bodyType: p.bodyType,
    isVerified: p.isVerified,
    featured: isFeatured(p.featuredUntil),
    photoUrl: p.photos[0]?.url ?? null,
    countryCode: p.country.code,
    citySlug: p.city.slug,
    cityName: p.city.name,
    commentsCount: p.commentsCount,
    likesCount: p.likesCount,
    ratingCount: p.ratingCount,
    ratingAvg: avg(p.ratingSum, p.ratingCount),
  };
}

type LocationFilter = { countryCode?: string; citySlug?: string };

function whereLocation(loc?: LocationFilter): Prisma.ProfileWhereInput {
  if (!loc) return {};
  const where: Prisma.ProfileWhereInput = {};
  if (loc.countryCode) where.country = { code: loc.countryCode };
  if (loc.citySlug) where.city = { slug: loc.citySlug };
  return where;
}

export async function getRecentProfiles(loc?: LocationFilter, take = 10) {
  const rows = await prisma.profile.findMany({
    where: { status: "active", ...whereLocation(loc) },
    orderBy: [{ createdAt: "desc" }],
    take,
    include: CARD_INCLUDE,
  });
  return rows.map(toCard);
}

export async function getPromotedProfiles(loc?: LocationFilter, take = 8) {
  const rows = await prisma.profile.findMany({
    where: {
      status: "active",
      featuredUntil: { gt: new Date() },
      ...whereLocation(loc),
    },
    orderBy: [{ featuredUntil: "desc" }],
    take,
    include: CARD_INCLUDE,
  });
  return rows.map(toCard);
}

export async function getRegularProfiles(loc?: LocationFilter, take = 24) {
  const rows = await prisma.profile.findMany({
    where: {
      status: "active",
      OR: [{ featuredUntil: null }, { featuredUntil: { lt: new Date() } }],
      ...whereLocation(loc),
    },
    orderBy: [{ createdAt: "desc" }],
    take,
    include: CARD_INCLUDE,
  });
  return rows.map(toCard);
}

export async function getRecentByCountry(code: string, take = 10) {
  return getRecentProfiles({ countryCode: code }, take);
}

export async function getCityProfiles(
  countryCode: string,
  citySlug: string,
  take = 48,
) {
  const rows = await prisma.profile.findMany({
    where: {
      status: "active",
      country: { code: countryCode },
      city: { slug: citySlug },
    },
    orderBy: [{ featuredUntil: "desc" }, { createdAt: "desc" }],
    take,
    include: CARD_INCLUDE,
  });
  return rows.map(toCard);
}

// ─── Detalle ───────────────────────────────────────────────────
export const getProfileBySlug = cache(async function getProfileBySlug(
  slug: string,
): Promise<ProfileView | null> {
  const p = await prisma.profile.findFirst({
    where: { slug, status: "active" },
    include: {
      photos: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      city: true,
      country: true,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          user: { select: { name: true, image: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: { user: { select: { name: true, image: true } } },
          },
        },
      },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    ownerId: p.userId,
    slug: p.slug,
    title: p.title,
    nickname: p.nickname,
    age: p.age,
    gender: p.gender,
    bodyType: p.bodyType,
    isVerified: p.isVerified,
    featured: isFeatured(p.featuredUntil),
    photoUrl: p.photos[0]?.url ?? null,
    countryCode: p.country.code,
    countryName: p.country.name,
    citySlug: p.city.slug,
    cityName: p.city.name,
    commentsCount: p.commentsCount,
    likesCount: p.likesCount,
    ratingCount: p.ratingCount,
    ratingAvg: avg(p.ratingSum, p.ratingCount),
    bio: p.bio,
    photos: p.photos.map((ph) => ({ url: ph.url, alt: ph.alt })),
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      authorName: c.user.name ?? "Anónimo",
      authorImage: c.user.image,
      authorId: c.userId,
      replies: c.replies.map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt,
        authorName: r.user.name ?? "Anónimo",
        authorImage: r.user.image,
        authorId: r.userId,
        replies: [],
      })),
    })),
    createdAt: p.createdAt,
  };
});

export async function getProfileIdBySlug(slug: string) {
  return prisma.profile.findUnique({
    where: { slug },
    select: { id: true, userId: true, title: true },
  });
}

export async function getUserInteraction(profileId: string, userId: string) {
  const [like, rating] = await Promise.all([
    prisma.like.findUnique({
      where: { profileId_userId: { profileId, userId } },
    }),
    prisma.rating.findUnique({
      where: { profileId_userId: { profileId, userId } },
    }),
  ]);
  return { liked: !!like, myRating: rating?.value ?? null };
}

export async function getRelated(
  countryCode: string,
  citySlug: string,
  excludeSlug: string,
  take = 4,
) {
  const rows = await prisma.profile.findMany({
    where: {
      status: "active",
      country: { code: countryCode },
      city: { slug: citySlug },
      slug: { not: excludeSlug },
    },
    orderBy: { createdAt: "desc" },
    take,
    include: CARD_INCLUDE,
  });
  return rows.map(toCard);
}

// ─── Mis anuncios ──────────────────────────────────────────────
export type MyProfileView = {
  slug: string;
  title: string;
  nickname: string;
  status: string;
  featured: boolean;
  isVerified: boolean;
  photoUrl: string | null;
  countryCode: string;
  citySlug: string;
  cityName: string;
  commentsCount: number;
  likesCount: number;
  ratingCount: number;
  ratingAvg: number;
  createdAt: Date;
};

export async function getProfilesByUser(
  userId: string,
): Promise<MyProfileView[]> {
  const rows = await prisma.profile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: CARD_INCLUDE,
  });
  return rows.map((p) => ({
    slug: p.slug,
    title: p.title,
    nickname: p.nickname,
    status: p.status,
    featured: isFeatured(p.featuredUntil),
    isVerified: p.isVerified,
    photoUrl: p.photos[0]?.url ?? null,
    countryCode: p.country.code,
    citySlug: p.city.slug,
    cityName: p.city.name,
    commentsCount: p.commentsCount,
    likesCount: p.likesCount,
    ratingCount: p.ratingCount,
    ratingAvg: avg(p.ratingSum, p.ratingCount),
    createdAt: p.createdAt,
  }));
}

// ─── Notificaciones ────────────────────────────────────────────
export function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function getNotifications(userId: string, take = 40) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      actor: { select: { name: true, image: true } },
      profile: {
        select: { slug: true, title: true, city: { select: { slug: true } }, country: { select: { code: true } } },
      },
    },
  });
}

// ─── Sitemap ───────────────────────────────────────────────────
export async function getAllActiveProfilePaths() {
  return prisma.profile.findMany({
    where: { status: "active" },
    select: {
      slug: true,
      updatedAt: true,
      city: { select: { slug: true } },
      country: { select: { code: true } },
    },
  });
}
