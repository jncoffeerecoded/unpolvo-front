import { PrismaClient } from "@prisma/client";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

const COUNTRIES: { code: string; name: string; locale: string; cities: string[] }[] =
  [
    { code: "es", name: "España", locale: "es", cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga"] },
    { code: "mx", name: "México", locale: "es", cities: ["Ciudad de México", "Guadalajara", "Monterrey", "Cancún"] },
    { code: "ar", name: "Argentina", locale: "es", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"] },
    { code: "co", name: "Colombia", locale: "es", cities: ["Bogotá", "Medellín", "Cali", "Cartagena"] },
    {
      code: "ve",
      name: "Venezuela",
      locale: "es",
      cities: [
        "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay",
        "Ciudad Guayana", "Maturín", "Puerto La Cruz", "Barcelona", "Cumaná",
        "San Cristóbal", "Mérida", "Punto Fijo", "Coro", "Guanare",
        "Acarigua", "Araure", "San Fernando de Apure", "Valle de la Pascua",
        "Calabozo", "San Juan de los Morros", "Puerto Ayacucho", "Tucupita",
        "Ciudad Bolívar", "Upata", "El Tigre", "Anaco", "Carúpano",
        "Porlamar", "La Asunción", "Los Teques", "Guarenas", "Guatire",
        "Charallave", "Ocumare del Tuy", "Cabimas", "Ciudad Ojeda",
        "Santa Rita", "Machiques", "La Fría", "Rubio", "Táriba", "Ejido",
        "El Vigía", "Valera", "Trujillo", "Carora", "Quíbor", "Yaritagua",
        "San Felipe", "Chivacoa", "Puerto Cabello", "Naguanagua", "Guacara",
        "San Carlos", "Tinaco", "Zaraza", "Altagracia de Orituco",
        "Higuerote", "Barlovento", "Lechería", "Guanta", "Puerto Ordaz",
        "San Félix",
      ],
    },
    { code: "cl", name: "Chile", locale: "es", cities: ["Santiago", "Valparaíso", "Concepción"] },
    { code: "pe", name: "Perú", locale: "es", cities: ["Lima", "Cusco", "Arequipa"] },
    { code: "us", name: "Estados Unidos", locale: "en", cities: ["New York", "Los Angeles", "Miami", "Chicago"] },
    { code: "br", name: "Brasil", locale: "pt", cities: ["São Paulo", "Rio de Janeiro", "Brasília"] },
  ];

type Person = {
  nickname: string;
  age: number;
  gender: string;
  country: string;
  city: string;
  bodyType?: string;
  bio: string;
  verified?: boolean;
  featured?: boolean;
};

const PEOPLE: Person[] = [
  { nickname: "Ana", age: 27, gender: "mujer", country: "es", city: "Madrid", bodyType: "promedio", bio: "Me encanta viajar, la buena comida y las conversaciones largas. Busco compartir aventuras.", verified: true, featured: true },
  { nickname: "Lucas", age: 31, gender: "hombre", country: "es", city: "Madrid", bodyType: "atletico", bio: "Runner de fin de semana y fan de la montaña. Busco gente con quien hacer planes al aire libre." },
  { nickname: "Marta", age: 24, gender: "mujer", country: "es", city: "Barcelona", bodyType: "delgado", bio: "Creativa y curiosa, siempre con un plan cultural. Me gusta el cine de autor y bailar.", verified: true, featured: true },
  { nickname: "Alex", age: 29, gender: "no-binario", country: "es", city: "Barcelona", bodyType: "promedio", bio: "Amante de los gatos, la música indie y las tardes tranquilas." },
  { nickname: "Carla", age: 33, gender: "mujer", country: "es", city: "Valencia", bodyType: "curvy", bio: "Disfruto de una buena novela, la playa y cocinar para quienes quiero." },
  { nickname: "Sofía", age: 26, gender: "mujer", country: "mx", city: "Ciudad de México", bodyType: "delgado", bio: "Chilanga de corazón, me encanta salir a bailar y descubrir cafeterías nuevas.", featured: true },
  { nickname: "Diego", age: 30, gender: "hombre", country: "mx", city: "Ciudad de México", bodyType: "promedio", bio: "Tranquilo, detallista y muy de planes caseros.", verified: true },
  { nickname: "Valeria", age: 22, gender: "mujer", country: "mx", city: "Guadalajara", bodyType: "delgado", bio: "Estudiante de diseño, amante de los perros y de los atardeceres." },
  { nickname: "Martina", age: 28, gender: "mujer", country: "ar", city: "Buenos Aires", bodyType: "promedio", bio: "Porteña, lectora empedernida y fanática del buen café.", verified: true, featured: true },
  { nickname: "Tomás", age: 34, gender: "hombre", country: "ar", city: "Buenos Aires", bodyType: "atletico", bio: "Apasionado del fútbol y los asados con amigos." },
  { nickname: "Isabella", age: 25, gender: "mujer", country: "co", city: "Medellín", bodyType: "curvy", bio: "Paisa alegre, me fascina bailar salsa y conocer culturas nuevas.", verified: true },
  { nickname: "Juan", age: 32, gender: "hombre", country: "co", city: "Medellín", bodyType: "promedio", bio: "Amante de la montaña y la fotografía. Busco compartir la vida con calma." },
  { nickname: "Andrea", age: 27, gender: "mujer", country: "ve", city: "Caracas", bodyType: "curvy", bio: "Caraqueña soñadora, me encanta la playa, el merengue y la buena compañía.", verified: true, featured: true },
  { nickname: "Carlos", age: 30, gender: "hombre", country: "ve", city: "Caracas", bodyType: "atletico", bio: "Ingeniero de día, músico de noche. Busco a alguien con buena energía." },
  { nickname: "Gabriela", age: 24, gender: "mujer", country: "ve", city: "Maracaibo", bodyType: "promedio", bio: "Maracucha de pura cepa, alegre y conversadora. Me gustan los planes espontáneos.", featured: true },
  { nickname: "Javiera", age: 29, gender: "mujer", country: "cl", city: "Santiago", bodyType: "delgado", bio: "Santiaguina aventurera, me encanta cocinar y escaparme a la cordillera.", verified: true },
  { nickname: "Daniela", age: 27, gender: "mujer", country: "pe", city: "Lima", bodyType: "promedio", bio: "Limeña foodie y amante de la fotografía. Busco gente espontánea." },
  { nickname: "Mia", age: 26, gender: "mujer", country: "us", city: "Miami", bodyType: "curvy", bio: "Beach lover and salsa dancer. Looking to meet genuine people.", verified: true, featured: true },
  { nickname: "Liam", age: 33, gender: "hombre", country: "us", city: "Miami", bodyType: "atletico", bio: "Into fitness, good food and weekend getaways." },
  { nickname: "Beatriz", age: 28, gender: "mujer", country: "br", city: "São Paulo", bodyType: "promedio", bio: "Paulistana apaixonada por música e boa comida.", verified: true },
];

const DEMO_USERS = [
  { email: "lucia.demo@citalia.test", name: "Lucía" },
  { email: "carlos.demo@citalia.test", name: "Carlos" },
  { email: "sofia.demo@citalia.test", name: "Sofía" },
];

const COMMENTS = [
  "¡Me encantaría conocerte! 😊",
  "Tienes una sonrisa preciosa",
  "¿Tomamos un café algún día?",
  "Muy buen perfil, saludos",
  "Coincidimos en muchos gustos",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Retratos de prueba (CDN público) según el género.
const portrait = (gender: string, k: number) => {
  const set =
    gender === "mujer" ? "women" : gender === "hombre" ? "men" : k % 2 ? "women" : "men";
  return `https://randomuser.me/api/portraits/${set}/${k % 99}.jpg`;
};

async function main() {
  // Limpieza (orden seguro respecto a FKs). Usuarios/cuentas se conservan.
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.like.deleteMany();
  await prisma.report.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();

  // Usuarios demo (para comentarios/likes/ratings).
  const demoIds: string[] = [];
  for (const u of DEMO_USERS) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: { email: u.email, name: u.name },
    });
    demoIds.push(created.id);
  }

  const cityId: Record<string, string> = {};
  const countryId: Record<string, string> = {};
  for (const c of COUNTRIES) {
    const country = await prisma.country.create({
      data: { code: c.code, name: c.name, locale: c.locale },
    });
    countryId[c.code] = country.id;
    for (const cityName of c.cities) {
      const slug = slugify(cityName);
      const city = await prisma.city.create({
        data: { slug, name: cityName, countryId: country.id },
      });
      cityId[`${c.code}/${slug}`] = city.id;
    }
  }

  let n = 0;
  for (const p of PEOPLE) {
    const citySlug = slugify(p.city);
    const cid = cityId[`${p.country}/${citySlug}`];
    const ctry = countryId[p.country];
    if (!cid || !ctry) continue;
    n++;

    // Interacciones de demo (consistentes con los contadores).
    const likers = demoIds.filter(() => Math.random() < 0.7);
    const raters = demoIds.filter(() => Math.random() < 0.7);
    const ratings = raters.map((userId) => ({
      userId,
      value: 3 + Math.floor(Math.random() * 3), // 3..5
    }));
    const nComments = Math.floor(Math.random() * 3); // 0..2
    const comments = Array.from({ length: nComments }).map(() => ({
      userId: pick(demoIds),
      body: pick(COMMENTS),
    }));
    const ratingSum = ratings.reduce((s, r) => s + r.value, 0);
    const photoUrls = [portrait(p.gender, n + 3), portrait(p.gender, n + 41)];

    await prisma.profile.create({
      data: {
        slug: `${slugify(p.nickname)}-${citySlug}-${n.toString(36)}`,
        title: `${p.nickname} · ${p.city}`,
        nickname: p.nickname,
        bio: p.bio,
        age: p.age,
        gender: p.gender,
        countryId: ctry,
        cityId: cid,
        bodyType: p.bodyType ?? null,
        status: "active",
        isVerified: !!p.verified,
        verifiedAt: p.verified ? new Date() : null,
        featuredUntil: p.featured
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null,
        likesCount: likers.length,
        commentsCount: comments.length,
        ratingCount: ratings.length,
        ratingSum,
        likes: { create: likers.map((userId) => ({ userId })) },
        ratings: { create: ratings },
        comments: { create: comments },
        photos: {
          create: photoUrls.map((url, i) => ({
            url,
            order: i,
            isPrimary: i === 0,
          })),
        },
      },
    });
  }

  console.log(`✔ Seed: ${COUNTRIES.length} países, ${n} perfiles + interacciones demo.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
