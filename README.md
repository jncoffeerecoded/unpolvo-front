# Citalia — Marketplace de citas (multipaís, SEO-first)

Portal de **perfiles de citas geolocalizados**. Cada persona publica su propio
perfil para conocer gente, con subpáginas indexables por país, ciudad y
categoría:

```
/{pais}/{ciudad}/{categoria}/{slug}
  ej. /es/madrid/relacion-seria/ana-madrid-1
```

## Stack

| Capa      | Tecnología                                            |
| --------- | ----------------------------------------------------- |
| Front+Back| Next.js 16 (App Router, RSC, Server Actions) + React 19 |
| Estilos   | Tailwind CSS v4                                       |
| DB        | Prisma ORM — SQLite (dev) / PostgreSQL (prod)         |
| Validación| Zod                                                  |
| i18n      | Diccionario por país (es / en / pt)                  |

## Arranque rápido (SQLite, cero configuración)

```bash
npm install
npm run db:push      # crea prisma/dev.db y las tablas
npm run db:seed      # 8 países, ciudades y perfiles de demo
npm run dev          # http://localhost:3000
```

## Scripts

| Script             | Acción                                            |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo                            |
| `npm run build`    | Build de producción                               |
| `npm run start`    | Servir el build                                   |
| `npm run db:push`  | Sincroniza el esquema con la DB                   |
| `npm run db:seed`  | Puebla la DB con datos de demo                    |
| `npm run db:reset` | Reinicia la DB y vuelve a sembrar                 |
| `npm run db:studio`| Prisma Studio (explorador visual de la DB)        |

## Pasar a PostgreSQL (producción)

1. `docker compose up -d`
2. En `.env`: `DATABASE_URL="postgresql://tuprepa:tuprepa@localhost:5432/tuprepa?schema=public"`
3. En `prisma/schema.prisma`: `provider = "postgresql"`
4. `npm run db:push && npm run db:seed`

El esquema evita enums y arrays nativos, así que es portable entre ambos.

## SEO

- **Rutas anidadas** `/{pais}/{ciudad}/{categoria}/{slug}` renderizadas en
  servidor (SSR + ISR `revalidate=300`).
- `generateMetadata` por página con **canonical**, OpenGraph y título dinámico.
- **Redirección 307 a la URL canónica** si los segmentos no coinciden (evita
  contenido duplicado).
- `sitemap.xml` dinámico (país → ciudad → categoría → perfil) y `robots.txt`.
- **JSON-LD** `ProfilePage` + `BreadcrumbList` en cada perfil.
- i18n por país con idioma derivado de `Country.locale`.

## Estructura

```
app/
  page.tsx                              # Home + selector de país
  [country]/page.tsx                    # Landing de país
  [country]/[city]/page.tsx             # Landing de ciudad
  [country]/[city]/[category]/page.tsx  # Listado (índice SEO)
  [country]/[city]/[category]/[slug]/   # Detalle de perfil + JSON-LD
  publicar/                             # Formulario de publicación + Server Action
  verificacion/                         # Verificación de identidad (KYC)
  sitemap.ts · robots.ts · not-found.tsx
components/   # Header, Footer, ProfileCard, Avatar, Breadcrumbs, AgeGate, icons
lib/         # prisma, data (queries), attributes, i18n, slug, seo
prisma/      # schema.prisma + seed.ts
```

## Seguridad y verificación

- **Puerta de edad +18** en el cliente.
- **Verificación de identidad** delegada en un proveedor KYC externo (Stripe
  Identity / Veriff / Onfido). Configura `STRIPE_SECRET_KEY` en `.env`.
  **Nunca se almacena biometría ni el documento**: solo el resultado.
- Moderación: los perfiles enviados deberían entrar como `pending` en
  producción (en demo se crean `active` para verlos al instante).

## Roadmap (siguientes fases)

- Autenticación (Auth.js) y panel del usuario.
- Mensajería entre perfiles.
- Subida real de fotos a almacenamiento (S3/R2) + moderación de imágenes.
- Pasarela de pago para "destacar" perfiles.
- Webhook de KYC que marca `isVerified`.
