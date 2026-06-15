import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

const FIELDS = [
  "title",
  "nickname",
  "bio",
  "age",
  "gender",
  "countryCode",
  "citySlug",
  "bodyType",
];

// Crea un perfil. El form del navegador hace fetch aquí (multipart) y recibe
// JSON limpio { slug, path } en éxito o { error, fieldErrors } en error — sin
// el formato "flight" de los Server Actions.
export async function POST(req: NextRequest) {
  const session = await auth();
  const token = session?.accessToken;
  if (!token) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para publicar." },
      { status: 401 },
    );
  }

  try {
    const incoming = await req.formData();
    const fd = new FormData();
    for (const key of FIELDS) {
      const v = incoming.get(key);
      if (v != null && v !== "") fd.append(key, v as string);
    }
    if (incoming.get("featured")) fd.append("featured", "true");
    // Importante: re-materializar cada foto a un Blob propio. El File que
    // devuelve req.formData() no lo puede re-serializar fetch (undici) al
    // reenviarlo, y el handler caería sin respuesta.
    for (const file of incoming.getAll("photoFiles")) {
      if (file instanceof File && file.size > 0) {
        const buf = Buffer.from(await file.arrayBuffer());
        const blob = new Blob([buf], {
          type: file.type || "application/octet-stream",
        });
        fd.append("photos", blob, file.name || "foto");
      }
    }

    const { ok, status, body } = await apiSend("/profiles", {
      method: "POST",
      token,
      form: fd,
    });
    if (ok) revalidatePath("/sitemap.xml");
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
