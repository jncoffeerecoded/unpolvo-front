import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { getConversation } from "@/lib/data";

// Devuelve la conversación (con mensajes) para que el cliente haga polling.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const conv = await getConversation(id, session.accessToken);
  if (!conv) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(conv);
}
