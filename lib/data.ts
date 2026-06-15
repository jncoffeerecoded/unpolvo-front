import { apiGet, getOrNull } from "./api";

// ─── View models (idénticos a los que devuelve el backend) ─────
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
  createdAt: string;
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
  createdAt: string;
};

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
  countryName: string;
  commentsCount: number;
  likesCount: number;
  ratingCount: number;
  ratingAvg: number;
  createdAt: string;
};

type CountryListItem = {
  id: string;
  code: string;
  name: string;
  locale: string;
  cities: { id: string; slug: string; name: string }[];
  _count: { profiles: number; cities: number };
};

type CountryDetail = {
  id: string;
  code: string;
  name: string;
  locale: string;
  _count: { profiles: number };
  cities: { id: string; slug: string; name: string; _count: { profiles: number } }[];
};

type CityDetail = {
  id: string;
  slug: string;
  name: string;
  country: { code: string; name: string; locale: string };
};

type LocationFilter = { countryCode?: string; citySlug?: string };

function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ─── Países / ciudades ─────────────────────────────────────────
export function getCountries() {
  return apiGet<CountryListItem[]>("/countries", { revalidate: 300 });
}

export function getCountry(code: string) {
  return getOrNull<CountryDetail>(`/countries/${code}`, { revalidate: 300 });
}

export function getCity(countryCode: string, citySlug: string) {
  return getOrNull<CityDetail>(
    `/countries/${countryCode}/cities/${citySlug}`,
    { revalidate: 300 },
  );
}

export function getCountriesWithCities() {
  return apiGet<{ code: string; name: string; cities: { slug: string; name: string }[] }[]>(
    "/countries-with-cities",
    { revalidate: 300 },
  );
}

// ─── Listados de perfiles ──────────────────────────────────────
function listProfiles(params: Record<string, string | undefined>) {
  return apiGet<ProfileCardView[]>(`/profiles${qs(params)}`, { revalidate: 120 });
}

export function getPromotedProfiles(loc?: LocationFilter, take = 8) {
  return listProfiles({
    featured: "true",
    country: loc?.countryCode,
    city: loc?.citySlug,
    take: String(take),
  });
}

export function getRegularProfiles(loc?: LocationFilter, take = 24) {
  return listProfiles({
    featured: "false",
    country: loc?.countryCode,
    city: loc?.citySlug,
    take: String(take),
  });
}

export function getRecentProfiles(loc?: LocationFilter, take = 10) {
  return listProfiles({
    country: loc?.countryCode,
    city: loc?.citySlug,
    take: String(take),
  });
}

export function getRecentByCountry(code: string, take = 10) {
  return getRecentProfiles({ countryCode: code }, take);
}

export function getCityProfiles(countryCode: string, citySlug: string, take = 48) {
  return listProfiles({ country: countryCode, city: citySlug, take: String(take) });
}

// ─── Detalle ───────────────────────────────────────────────────
export function getProfileBySlug(slug: string) {
  return getOrNull<ProfileView>(`/profiles/${slug}`, { revalidate: 120 });
}

export function getRelated(slug: string) {
  return apiGet<ProfileCardView[]>(`/profiles/${slug}/related`, {
    revalidate: 120,
  });
}

// ─── Con sesión (token del backend) ────────────────────────────
export function getInteraction(profileId: string, token: string) {
  return apiGet<{ liked: boolean; myRating: number | null }>(
    `/profiles/${profileId}/interaction`,
    { token },
  );
}

export function getMyProfiles(token: string) {
  return apiGet<MyProfileView[]>("/me/profiles", { token });
}

export function getUnreadCount(token: string) {
  return apiGet<{ count: number }>("/notifications/unread-count", { token });
}

export type NotificationView = {
  id: string;
  type: string;
  body: string | null;
  read: boolean;
  createdAt: string;
  actor: { name: string | null; image: string | null } | null;
  profile: {
    slug: string;
    title: string;
    city: { slug: string };
    country: { code: string };
  } | null;
};

export function getNotifications(token: string) {
  return apiGet<NotificationView[]>("/notifications", { token });
}

// ─── Sitemap ───────────────────────────────────────────────────
export async function getAllActiveProfilePaths() {
  const cards = await apiGet<ProfileCardView[]>("/profiles?take=49000", {
    revalidate: 3600,
  });
  return cards.map((c) => ({
    slug: c.slug,
    countryCode: c.countryCode,
    citySlug: c.citySlug,
  }));
}
