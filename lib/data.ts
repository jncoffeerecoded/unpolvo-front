import { apiGet, getOrNull } from "./api";

// ─── View models (idénticos a los que devuelve el backend) ─────
export type ProfileCardView = {
  slug: string;
  title: string;
  nickname: string;
  excerpt: string;
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

export type PlanView = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  mediaCount: number;
};

export type ProfileView = ProfileCardView & {
  id: string;
  ownerId: string | null;
  bio: string;
  countryName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  photos: { url: string; alt: string | null }[];
  plans: PlanView[];
  comments: CommentView[];
  createdAt: string;
};

// ─── Suscripciones ─────────────────────────────────────────────
export type PremiumMediaView = { id: string; type: string; order: number };

export type AdminPlanView = PlanView & {
  active: boolean;
  order: number;
  subscriberCount: number;
  media: PremiumMediaView[];
};

export type MySubscriptionView = {
  id: string;
  planId: string;
  status: "pending" | "approved" | "rejected";
  conversationId: string | null;
  plan: { id: string; name: string; price: number; currency: string };
  profile: { slug: string; nickname: string };
};

export type SubscriberView = {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decidedAt: string | null;
  conversationId: string | null;
  subscriber: { id: string; name: string; image: string | null };
  plan: { id: string; name: string; price: number; currency: string };
};

// ─── Chat / mensajería interna ─────────────────────────────────
export type ConversationListItem = {
  id: string;
  status: "pending" | "accepted";
  role: "owner" | "guest";
  profile: { slug: string; nickname: string; title: string };
  otherName: string;
  otherImage: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unread: number;
};

export type ChatMessage = {
  id: string;
  body: string;
  mine: boolean;
  createdAt: string;
  attachments: { id: string; type: string }[];
};

export type ConversationView = {
  id: string;
  status: "pending" | "accepted";
  role: "owner" | "guest";
  canSend: boolean;
  profile: { slug: string; nickname: string; title: string };
  otherName: string;
  otherImage: string | null;
  messages: ChatMessage[];
};

export type MyProfileView = {
  id: string;
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

export function getMyConversations(token: string) {
  return apiGet<ConversationListItem[]>("/chat/conversations", { token });
}

export function getConversation(id: string, token: string) {
  return getOrNull<ConversationView>(`/chat/conversations/${id}`, { token });
}

export function getChatUnread(token: string) {
  return apiGet<{ count: number }>("/chat/unread-count", { token });
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

// ─── Suscripciones ─────────────────────────────────────────────
export function getMySubscriptions(token: string) {
  return apiGet<MySubscriptionView[]>("/me/subscriptions", { token });
}

export function getProfilePlansAdmin(profileId: string, token: string) {
  return apiGet<AdminPlanView[]>(`/me/profiles/${profileId}/plans`, { token });
}

export function getSubscribers(profileId: string, token: string) {
  return apiGet<SubscriberView[]>(`/me/profiles/${profileId}/subscribers`, {
    token,
  });
}

export function getPlanContent(planId: string, token: string) {
  return getOrNull<{ planId: string; media: PremiumMediaView[] }>(
    `/plans/${planId}/content`,
    { token },
  );
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
