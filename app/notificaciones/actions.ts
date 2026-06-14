"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
}
