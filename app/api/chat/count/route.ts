import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getChatUnread } from "@/lib/data";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) return NextResponse.json({ count: 0 });
  try {
    const { count } = await getChatUnread(session.accessToken);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
