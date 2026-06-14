"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsRead } from "./actions";

// Marca las notificaciones como leídas al entrar y refresca el contador.
export function MarkRead() {
  const router = useRouter();
  useEffect(() => {
    markNotificationsRead().then(() => router.refresh());
  }, [router]);
  return null;
}
