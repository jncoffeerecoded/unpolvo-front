import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMySubscriptions } from "@/lib/data";

// Estado de las suscripciones del usuario (lo consume el panel de la ficha).
export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const subs = await getMySubscriptions(session.accessToken);
    return NextResponse.json(subs);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
