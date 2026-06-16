// i18n ligero por país. `es` completo, `en` completo, `pt` hereda de `es`.

export type Locale = "es" | "en" | "pt";
export const LOCALES: Locale[] = ["es", "en", "pt"];
export const DEFAULT_LOCALE: Locale = "es";

export interface Dict {
  ui: {
    tagline: string;
    publish: string;
    verified: string;
    verifiedHint: string;
    popularCities: string;
    recentProfiles: string;
    promoted: string;
    featured: string;
    about: string;
    details: string;
    age: string;
    years: string;
    bodyType: string;
    contact: string;
    report: string;
    comments: string;
    addComment: string;
    rate: string;
    like: string;
    noResults: string;
    beFirst: string;
    profilesIn: string;
    home: string;
    chooseCountry: string;
    nearYou: string;
  };
  gender: Record<string, string>;
  bodyType: Record<string, string>;
}

const es: Dict = {
  ui: {
    tagline: "Chicas disponibles en tu ciudad",
    publish: "Publicar perfil",
    verified: "Verificado",
    verifiedHint: "Identidad verificada con documento oficial",
    popularCities: "Ciudades populares",
    recentProfiles: "Perfiles recientes",
    promoted: "Perfiles promocionales",
    featured: "Destacado",
    about: "Sobre mí",
    details: "Detalles",
    age: "Edad",
    years: "años",
    bodyType: "Complexión",
    contact: "Contactar",
    report: "Reportar",
    comments: "Comentarios",
    addComment: "Escribe un comentario…",
    rate: "Valora este perfil",
    like: "Me gusta",
    noResults: "Todavía no hay perfiles en esta búsqueda.",
    beFirst: "Sé la primera persona en publicar aquí.",
    profilesIn: "perfiles en",
    home: "Inicio",
    chooseCountry: "Elige tu país",
    nearYou: "Cerca de ti",
  },
  gender: { mujer: "Mujer", hombre: "Hombre", "no-binario": "No binario" },
  bodyType: {
    delgado: "Delgada/o",
    atletico: "Atlética/o",
    promedio: "Promedio",
    curvy: "Con curvas",
  },
};

const en: Dict = {
  ui: {
    tagline: "Meet people near you",
    publish: "Post a profile",
    verified: "Verified",
    verifiedHint: "Identity verified with official ID",
    popularCities: "Popular cities",
    recentProfiles: "Recent profiles",
    promoted: "Promoted profiles",
    featured: "Featured",
    about: "About me",
    details: "Details",
    age: "Age",
    years: "years",
    bodyType: "Body type",
    contact: "Contact",
    report: "Report",
    comments: "Comments",
    addComment: "Write a comment…",
    rate: "Rate this profile",
    like: "Like",
    noResults: "No profiles in this search yet.",
    beFirst: "Be the first to post here.",
    profilesIn: "profiles in",
    home: "Home",
    chooseCountry: "Choose your country",
    nearYou: "Near you",
  },
  gender: { mujer: "Woman", hombre: "Man", "no-binario": "Non-binary" },
  bodyType: {
    delgado: "Slim",
    atletico: "Athletic",
    promedio: "Average",
    curvy: "Curvy",
  },
};

const pt: Dict = {
  ...es,
  ui: {
    ...es.ui,
    tagline: "Conheça pessoas perto de você",
    recentProfiles: "Perfis recentes",
    nearYou: "Perto de você",
  },
};

const DICTS: Record<Locale, Dict> = { es, en, pt };

export function getDict(locale: string): Dict {
  return DICTS[(locale as Locale) in DICTS ? (locale as Locale) : DEFAULT_LOCALE];
}
