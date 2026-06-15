"use server";

import { auth } from "@/auth";
import { apiSend } from "@/lib/api";

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.accessToken) return;
  await apiSend("/notifications/read", {
    method: "POST",
    token: session.accessToken,
  });
}
