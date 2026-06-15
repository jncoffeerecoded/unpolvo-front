import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUnreadCount } from "@/lib/data";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ count: 0 });
  try {
    const { count } = await getUnreadCount(session.accessToken);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
