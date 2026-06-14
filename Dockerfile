# syntax=docker/dockerfile:1

# ---- Builder ----
FROM node:22-slim AS builder
WORKDIR /app
# OpenSSL: requerido por el motor de Prisma. ca-certificates para conexiones TLS.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1

# Instala dependencias (postinstall ejecuta `prisma generate`).
# Usamos `npm install` (no `npm ci`) porque sharp necesita binarios específicos
# de Linux que el lockfile generado en otra plataforma puede no incluir.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund

# Copia el resto y construye. Placeholders solo durante el build (el sitemap es
# resiliente si la BD no responde); en runtime mandan las variables de Railway.
COPY . .
RUN AUTH_SECRET="build-placeholder" \
    DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    npm run build

# ---- Runner ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Artefactos necesarios para `next start`.
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
# Railway define $PORT; Next lo respeta. -H 0.0.0.0 para aceptar tráfico externo.
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
