# Despliegue en Railway

La app se despliega con **Docker** (ver `Dockerfile` y `railway.json`). Railway
detecta `railway.json` y construye con el Dockerfile automáticamente.

## 1. Subir el código

Sube el repo a GitHub (o usa la CLI de Railway: `railway up`).

## 2. Crear el servicio en Railway

- New Project → Deploy from GitHub repo (o añade un servicio al proyecto que ya
  tiene tu PostgreSQL).
- Railway leerá `railway.json`:
  - **builder**: `DOCKERFILE`
  - **healthcheck**: `GET /api/health`
  - **startCommand**: `npx next start -H 0.0.0.0` (usa el `$PORT` de Railway)

## 3. Variables de entorno (Service → Variables)

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Postgres de Railway. Si la BD está en el **mismo proyecto**, usa la referencia interna `${{Postgres.DATABASE_URL}}` (más rápida y sin egress). |
| `AUTH_SECRET` | Secreto fuerte: `npx auth secret` u `openssl rand -base64 33`. |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_SITE_URL` | El dominio público del servicio, p. ej. `https://tuprepa.up.railway.app` (para canonical, sitemap y OpenGraph). |
| `S3_ENDPOINT` | `https://t3.storageapi.dev` |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | `imagenes-bfoawjul5mnalr3f` |
| `S3_ACCESS_KEY_ID` | (tu key) |
| `S3_SECRET_ACCESS_KEY` | (tu secret) |

> No subas estos valores al repo: configúralos solo en Railway. El `.env` local
> está en `.gitignore`.

## 4. Esquema de base de datos

El esquema ya se aplicó con `prisma db push`. Para cambios futuros:

```bash
# apuntando a la DATABASE_URL de Railway
npm run db:push       # sincroniza el esquema (sin migraciones versionadas)
npm run db:seed       # opcional: datos de demo
```

(Para producción seria conviene migrar a `prisma migrate` versionado.)

## 5. Deploy

Railway construye la imagen y arranca. El healthcheck `/api/health` debe
responder `{"status":"ok"}`. La app sirve en el dominio asignado.

## Notas

- **Imágenes**: se suben al bucket (privado) comprimidas a WebP y se sirven por
  el proxy same-origin `/api/img/...`. Si haces el bucket **público** en el panel
  de Tigris, puedes servirlas directo por CDN (ver comentario en `lib/storage.ts`)
  y añadir ese dominio a `img-src` en `next.config.ts`.
- **Rate limiting** en memoria (por instancia). Si escalas a varias réplicas, usa
  Redis (Upstash) en `lib/rate-limit.ts`.
- El `Dockerfile` usa `npm install` (no `npm ci`) porque `sharp` necesita
  binarios de Linux que el lockfile generado en otra plataforma puede no incluir.
