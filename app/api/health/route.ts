import { NextResponse } from "next/server";

// Healthcheck para Railway: liveness simple (no toca la BD).
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", ts: Date.now() });
}
