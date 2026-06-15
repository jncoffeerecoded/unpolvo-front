"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment, deleteComment, type CommentState } from "./actions";
import type { CommentView } from "@/lib/data";

function CommentForm({
  profileId,
  path,
  parentId = "",
  placeholder,
  submitLabel,
  onDone,
  autoFocus,
}: {
  profileId: string;
  path: string;
  parentId?: string;
  placeholder: string;
  submitLabel: string;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<CommentState, FormData>(
    addComment,
    {},
  );
  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      router.refresh();
      onDone?.();
    }
  }, [state.ok, router, onDone]);

  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="parentId" value={parentId} />
      <Textarea
        name="body"
        rows={2}
        placeholder={placeholder}
        maxLength={1000}
        autoFocus={autoFocus}
      />
      {state.error && (
        <p className="text-xs font-medium text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        <Icon name="chat" className="h-4 w-4" />
        {pending ? "Enviando…" : submitLabel}
      </Button>
    </form>
  );
}

function DeleteButton({ commentId, path }: { commentId: string; path: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await deleteComment(commentId, path);
          router.refresh();
        })
      }
      className="text-muted-foreground transition hover:text-destructive disabled:opacity-50"
      aria-label="Borrar comentario"
      title="Borrar"
    >
      <Icon name="x" className="h-4 w-4" />
    </button>
  );
}

function CommentRow({
  comment,
  canDelete,
  path,
  indent,
}: {
  comment: CommentView;
  canDelete: boolean;
  path: string;
  indent?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${indent ? "ml-11" : ""}`}>
      <Avatar
        name={comment.authorName}
        photoUrl={comment.authorImage}
        className="h-9 w-9 shrink-0 rounded-full"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {comment.authorName}{" "}
          <span className="font-normal text-muted-foreground">
            · {new Date(comment.createdAt).toLocaleDateString("es")}
          </span>
        </p>
        <p className="text-sm text-foreground/90">{comment.body}</p>
      </div>
      {canDelete && <DeleteButton commentId={comment.id} path={path} />}
    </div>
  );
}

export function Comments({
  profileId,
  path,
  comments,
  currentUserId,
  ownerId,
  isLoggedIn,
}: {
  profileId: string;
  path: string;
  comments: CommentView[];
  currentUserId: string | null;
  ownerId: string | null;
  isLoggedIn: boolean;
}) {
  const isOwner = !!currentUserId && currentUserId === ownerId;
  const canDelete = (authorId: string) =>
    !!currentUserId && (currentUserId === authorId || isOwner);
  const alreadyCommented =
    !!currentUserId && comments.some((c) => c.authorId === currentUserId);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {!isLoggedIn ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/login?next=${encodeURIComponent(path)}`}>
            Inicia sesión para comentar
          </Link>
        </Button>
      ) : isOwner ? (
        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Este es tu anuncio: puedes responder y moderar comentarios, pero no
          comentarlo ni valorarlo.
        </p>
      ) : alreadyCommented ? (
        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Ya comentaste este anuncio. Puedes responder a otros comentarios.
        </p>
      ) : (
        <CommentForm
          profileId={profileId}
          path={path}
          placeholder="Escribe un comentario…"
          submitLabel="Comentar"
        />
      )}

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sé la primera persona en comentar.
        </p>
      )}

      <div className="space-y-5">
        {comments.map((c) => (
          <div key={c.id} className="space-y-3">
            <CommentRow
              comment={c}
              canDelete={canDelete(c.authorId)}
              path={path}
            />
            {isLoggedIn && (
              <div className="ml-11">
                <button
                  type="button"
                  onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {replyTo === c.id ? "Cancelar" : "Responder"}
                </button>
              </div>
            )}
            {replyTo === c.id && (
              <div className="ml-11">
                <CommentForm
                  profileId={profileId}
                  path={path}
                  parentId={c.id}
                  placeholder={`Responder a ${c.authorName}…`}
                  submitLabel="Responder"
                  autoFocus
                  onDone={() => setReplyTo(null)}
                />
              </div>
            )}
            {c.replies.map((r) => (
              <CommentRow
                key={r.id}
                comment={r}
                canDelete={canDelete(r.authorId)}
                path={path}
                indent
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
