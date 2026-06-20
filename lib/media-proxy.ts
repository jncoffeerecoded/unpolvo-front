import { type NextRequest } from "next/server";
import { auth } from "@/auth";
import { API_BASE } from "@/lib/api";

// Proxy autenticado de contenido privado: lee la sesión NextAuth, reenvía al
// backend con el token y el header Range (vídeo), y hace stream de la respuesta.
// Permite usar <img>/<video> apuntando a /api/media/... (mismo origen, cookie).
export async function proxyMedia(
  req: NextRequest,
  backendPath: string,
): Promise<Response> {
  const session = await auth();
  if (!session?.accessToken) {
    return new Response("unauthorized", { status: 401 });
  }

  const range = req.headers.get("range");
  const backendRes = await fetch(`${API_BASE}${backendPath}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(range ? { Range: range } : {}),
    },
    cache: "no-store",
  });

  if (backendRes.status >= 400) {
    return new Response(null, { status: backendRes.status });
  }

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const v = backendRes.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("Cache-Control", "private, no-store");
  return new Response(backendRes.body, { status: backendRes.status, headers });
}
