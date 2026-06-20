import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { getPlanContent } from "@/lib/data";

// Lista de media de un plan, solo si el viewer está aprobado (o es el dueño).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> },
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { planId } = await params;
  const content = await getPlanContent(planId, session.accessToken);
  if (!content) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(content);
}
