"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage, type SendState } from "../actions";
import type { ConversationView, ChatMessage } from "@/lib/data";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Chat({ initial }: { initial: ConversationView }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [status, setStatus] = useState(initial.status);
  const [canSend, setCanSend] = useState(initial.canSend);
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [state, action, pending] = useActionState<SendState, FormData>(
    sendMessage,
    {},
  );

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  // Polling cada 4 s para traer mensajes nuevos del otro participante.
  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/chat/${initial.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ConversationView;
        if (!active) return;
        setMessages(data.messages);
        setStatus(data.status);
        setCanSend(data.canSend);
      } catch {
        /* reintento en el siguiente tick */
      }
    }
    const t = setInterval(poll, 4000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [initial.id]);

  // Tras enviar con éxito: limpiar y refrescar.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setPreviews([]);
      fetch(`/api/chat/${initial.id}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: ConversationView | null) => {
          if (data) {
            setMessages(data.messages);
            setStatus(data.status);
            setCanSend(data.canSend);
          }
        })
        .catch(() => {});
    }
  }, [state.ok, initial.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const guestPending = status === "pending" && initial.role === "guest";

  return (
    <div className="flex flex-col rounded-2xl border bg-card">
      {/* Mensajes */}
      <div className="flex max-h-[60vh] min-h-[320px] flex-col gap-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="m-auto text-sm text-muted-foreground">
            No hay mensajes todavía.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                m.mine
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted"
              }`}
            >
              {m.attachments?.length > 0 && (
                <div className="mb-1 grid grid-cols-2 gap-1.5">
                  {m.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={`/api/media/chat/${a.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/media/chat/${a.id}`}
                        alt="Adjunto"
                        className="aspect-square w-full rounded-lg object-cover ring-1 ring-black/10"
                      />
                    </a>
                  ))}
                </div>
              )}
              {m.body && <p className="whitespace-pre-line break-words">{m.body}</p>}
              <p
                className={`mt-1 text-[10px] ${
                  m.mine ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {formatTime(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t p-3">
        {guestPending ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-center text-xs text-amber-600">
            Enviaste tu mensaje. Podrás seguir escribiendo cuando el autor te
            responda.
          </p>
        ) : !canSend ? (
          <p className="px-4 py-3 text-center text-xs text-muted-foreground">
            No puedes escribir en esta conversación.
          </p>
        ) : (
          <form ref={formRef} action={action} className="space-y-2">
            <input type="hidden" name="conversationId" value={initial.id} />
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Adjunto ${i + 1}`}
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
                  />
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={fileRef}
                type="file"
                name="images"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                className="sr-only"
                onChange={onPickFiles}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileRef.current?.click()}
                aria-label="Adjuntar imagen"
              >
                <Icon name="image" className="h-5 w-5" />
              </Button>
              <Textarea
                name="body"
                rows={1}
                maxLength={2000}
                placeholder="Escribe un mensaje…"
                className="min-h-10 flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={pending} aria-label="Enviar">
                <Icon name="send" className="h-5 w-5" />
              </Button>
            </div>
          </form>
        )}
        {state.error && (
          <p className="mt-2 text-center text-xs font-medium text-destructive">
            {state.error}
          </p>
        )}
      </div>
    </div>
  );
}
