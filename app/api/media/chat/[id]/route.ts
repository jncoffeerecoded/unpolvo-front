import { type NextRequest } from "next/server";
import { proxyMedia } from "@/lib/media-proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyMedia(req, `/media/chat/${id}`);
}
