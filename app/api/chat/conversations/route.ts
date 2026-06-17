import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMyConversations } from "@/lib/data";

// Lista de conversaciones del usuario, para el chat flotante (polling cliente).
export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const conversations = await getMyConversations(session.accessToken);
    return NextResponse.json(conversations);
  } catch {
    return NextResponse.json([]);
  }
}
