// Atributos del perfil (modelo simplificado: género + complexión).

export const GENDERS = ["mujer", "hombre", "no-binario"] as const;
export type Gender = (typeof GENDERS)[number];

export const BODY_TYPES = ["delgado", "atletico", "promedio", "curvy"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const GENDER_ICON: Record<Gender, string> = {
  mujer: "venus",
  hombre: "mars",
  "no-binario": "nonbinary",
};

// Iconos minimalistas (siluetas vectoriales abstractas, no figuras).
export const BODY_TYPE_ICON: Record<BodyType, string> = {
  delgado: "buildSlim",
  atletico: "buildAthletic",
  promedio: "buildAverage",
  curvy: "buildCurvy",
};
