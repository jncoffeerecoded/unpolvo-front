import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

// Sube fotos/vídeos al paquete de un plan (multipart). Re-materializa cada File
// a Blob propio para que fetch (undici) pueda reenviarlo al backend.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> },
) {
  const session = await auth();
  const token = session?.accessToken;
  if (!token) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { planId } = await params;

  try {
    const incoming = await req.formData();
    const fd = new FormData();
    for (const file of incoming.getAll("files")) {
      if (file instanceof File && file.size > 0) {
        const buf = Buffer.from(await file.arrayBuffer());
        const blob = new Blob([buf], {
          type: file.type || "application/octet-stream",
        });
        fd.append("files", blob, file.name || "archivo");
      }
    }
    const { ok, status, body } = await apiSend(`/me/plans/${planId}/media`, {
      method: "POST",
      token,
      form: fd,
    });
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la subida." },
      { status: 500 },
    );
  }
}
