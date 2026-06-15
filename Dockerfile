# syntax=docker/dockerfile:1

# ---- Builder ----
FROM node:22-slim AS builder
WORKDIR /app
# ca-certificates para conexiones TLS (las fotos y la API viven en el backend).
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1

# Instala dependencias. El front ya no usa Prisma ni sharp: solo consume la API.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Copia el resto y construye. AUTH_SECRET es un placeholder solo para el build;
# en runtime mandan las variables de Railway. El sitemap es resiliente si la API
# no responde durante el build (se regenera por ISR en runtime).
COPY . .
RUN AUTH_SECRET="build-placeholder" npm run build

# ---- Runner ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Artefactos necesarios para `next start`.
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
# Railway define $PORT; Next lo respeta. -H 0.0.0.0 para aceptar tráfico externo.
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
