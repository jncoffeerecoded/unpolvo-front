import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

// Cubos de límite por tipo de ruta (límite / ventana en ms).
function bucket(path: string, method: string) {
  if (path.startsWith("/api/auth/callback") || path.startsWith("/api/auth/signin")) {
    return { name: "auth", limit: 15, windowMs: 60_000 }; // anti fuerza bruta
  }
  if (path.startsWith("/api/")) {
    return { name: "api", limit: 120, windowMs: 60_000 };
  }
  if (method === "POST") {
    return { name: "mutation", limit: 50, windowMs: 60_000 }; // server actions
  }
  return { name: "page", limit: 300, windowMs: 60_000 };
}

export function middleware(req: NextRequest) {
  const ip = clientIp(req);
  const { name, limit, windowMs } = bucket(req.nextUrl.pathname, req.method);
  const result = rateLimit(`${name}:${ip}`, limit, windowMs);

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return new NextResponse(
      JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo más tarde." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  return res;
}

// No aplicar a estáticos ni a las fotos subidas.
export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|robots.txt|sitemap|uploads/|api/img/|api/health).*)",
  ],
};
