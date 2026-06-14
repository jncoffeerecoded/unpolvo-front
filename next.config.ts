import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. En dev se permite 'unsafe-eval' (HMR de Turbopack).
// En prod, añade el dominio público de tu bucket de fotos a img-src.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://randomuser.me",
  "font-src 'self' data:",
  "connect-src 'self'",
  "upgrade-insecure-requests",
]
  .join("; ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // oculta "X-Powered-By: Next.js"
  serverExternalPackages: ["sharp"], // módulo nativo: no empaquetar
  experimental: {
    // Permite subir fotos vía Server Actions (por defecto el límite es 1 MB).
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
