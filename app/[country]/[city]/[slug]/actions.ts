"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

async function getOwnerId(profileId: string): Promise<string | null> {
  const p = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  return p?.userId ?? null;
}

async function notifyOwner(
  profileId: string,
  actorId: string,
  type: "comment" | "like" | "rating",
  body?: string,
) {
  const ownerId = await getOwnerId(profileId);
  if (ownerId && ownerId !== actorId) {
    await prisma.notification.create({
      data: { userId: ownerId, actorId, profileId, type, body },
    });
  }
}

export type CommentState = { error?: string; ok?: boolean };

export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Inicia sesión para comentar." };
  const userId = session.user.id;

  if (!rateLimit(`comment:${userId}`, 5, 60_000).success) {
    return { error: "Demasiados comentarios seguidos. Espera un momento." };
  }

  const parsed = z
    .object({
      profileId: z.string().min(1),
      path: z.string().min(1),
      body: z.string().trim().min(2, "Escribe un comentario").max(1000),
      parentId: z.string().optional(),
    })
    .safeParse({
      profileId: formData.get("profileId"),
      path: formData.get("path"),
      body: formData.get("body"),
      parentId: formData.get("parentId") || undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { profileId, body, path, parentId } = parsed.data;
  const ownerId = await getOwnerId(profileId);
  const isOwner = !!ownerId && ownerId === userId;

  // El propietario solo puede responder, no crear comentarios nuevos.
  if (!parentId && isOwner) {
    return {
      error: "Como propietario solo puedes responder comentarios, no crear nuevos.",
    };
  }

  // Un usuario solo puede comentar (top-level) una vez por anuncio.
  if (!parentId && !isOwner) {
    const existing = await prisma.comment.findFirst({
      where: { profileId, userId, parentId: null },
      select: { id: true },
    });
    if (existing) return { error: "Ya has comentado este anuncio." };
  }

  let parent: { userId: string; profileId: string } | null = null;
  if (parentId) {
    parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { userId: true, profileId: true },
    });
    if (!parent || parent.profileId !== profileId) {
      return { error: "Comentario no válido." };
    }
  }

  await prisma.$transaction([
    prisma.comment.create({
      data: { profileId, userId, body, parentId: parentId ?? null },
    }),
    prisma.profile.update({
      where: { id: profileId },
      data: { commentsCount: { increment: 1 } },
    }),
  ]);

  // Notificaciones
  if (isOwner && parent) {
    // El dueño respondió → avisa a quien escribió el comentario.
    if (parent.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: parent.userId,
          actorId: userId,
          profileId,
          type: "comment",
          body: body.slice(0, 120),
        },
      });
    }
  } else {
    // Comentario/respuesta de un tercero → avisa al dueño.
    await notifyOwner(profileId, userId, "comment", body.slice(0, 120));
  }

  revalidatePath(path);
  return { ok: true };
}

export async function deleteComment(
  commentId: string,
  path: string,
): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "login" };
  const userId = session.user.id;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      userId: true,
      profileId: true,
      profile: { select: { userId: true } },
      _count: { select: { replies: true } },
    },
  });
  if (!comment) return { error: "El comentario no existe." };

  // Puede borrar: el autor del comentario o el propietario del anuncio.
  const isAuthor = comment.userId === userId;
  const isOwner = comment.profile.userId === userId;
  if (!isAuthor && !isOwner) return { error: "No autorizado." };

  const removed = 1 + comment._count.replies; // el comentario + sus respuestas
  await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.profile.update({
      where: { id: comment.profileId },
      data: { commentsCount: { decrement: removed } },
    }),
  ]);
  revalidatePath(path);
  return { ok: true };
}

export async function toggleLike(profileId: string, path: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "login" };
  const userId = session.user.id;
  if (!rateLimit(`like:${userId}`, 40, 60_000).success) return { error: "rate" };

  if ((await getOwnerId(profileId)) === userId) {
    return { error: "No puedes dar like a tu propio anuncio." };
  }

  const existing = await prisma.like.findUnique({
    where: { profileId_userId: { profileId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.profile.update({
        where: { id: profileId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.like.create({ data: { profileId, userId } }),
      prisma.profile.update({
        where: { id: profileId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
    await notifyOwner(profileId, userId, "like");
  }
  revalidatePath(path);
  return { liked: !existing };
}

export async function rateProfile(
  profileId: string,
  value: number,
  path: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "login" };
  const userId = session.user.id;
  if (!rateLimit(`rate:${userId}`, 40, 60_000).success) return { error: "rate" };

  if ((await getOwnerId(profileId)) === userId) {
    return { error: "No puedes valorar tu propio anuncio." };
  }

  const v = Math.max(1, Math.min(5, Math.round(value)));
  const existing = await prisma.rating.findUnique({
    where: { profileId_userId: { profileId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.rating.update({ where: { id: existing.id }, data: { value: v } }),
      prisma.profile.update({
        where: { id: profileId },
        data: { ratingSum: { increment: v - existing.value } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.rating.create({ data: { profileId, userId, value: v } }),
      prisma.profile.update({
        where: { id: profileId },
        data: { ratingSum: { increment: v }, ratingCount: { increment: 1 } },
      }),
    ]);
    await notifyOwner(profileId, userId, "rating", String(v));
  }
  revalidatePath(path);
  return { myRating: v };
}
