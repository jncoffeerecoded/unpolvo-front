"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Icon } from "./icons";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage, type SendState } from "@/app/mensajes/actions";
import type {
  ConversationListItem,
  ConversationView,
  ChatMessage,
} from "@/lib/data";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return new Date(iso).toLocaleDateString("es");
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FloatingChat() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [convs, setConvs] = useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Lista de conversaciones: polling mientras hay sesión.
  const loadConvs = useCallback(() => {
    fetch("/api/chat/conversations", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setConvs(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadConvs();
    const t = setInterval(loadConvs, 15000);
    return () => clearInterval(t);
  }, [status, loadConvs]);

  if (status !== "authenticated") return null;

  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);
  const active = convs.find((c) => c.id === activeId) ?? null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="flex h-[28rem] w-[20rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:w-[22rem]">
          {activeId && active ? (
            <ChatPanel
              conv={active}
              onBack={() => setActiveId(null)}
              onActivity={loadConvs}
            />
          ) : (
            <ConvList
              convs={convs}
              onClose={() => setOpen(false)}
              onPick={(id) => setActiveId(id)}
            />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mensajes"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 active:scale-95"
      >
        <Icon name={open ? "x" : "chat"} className="h-6 w-6" />
        {!open && totalUnread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}

function ConvList({
  convs,
  onClose,
  onPick,
}: {
  convs: ConversationListItem[];
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  return (
    <>
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="chat" className="h-4 w-4" />
          Mensajes
        </h2>
        <div className="flex items-center gap-1">
          <Link
            href="/mensajes"
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
            aria-label="Ver todos"
            title="Ver todos los mensajes"
          >
            <Icon name="expand" className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
            aria-label="Cerrar"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {convs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <Icon name="chat" className="h-7 w-7" />
            <p className="text-sm">Aún no tienes conversaciones.</p>
          </div>
        ) : (
          <ul>
            {convs.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onPick(c.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50 ${
                    c.unread > 0 ? "bg-primary/5" : ""
                  }`}
                >
                  <Avatar
                    name={c.otherName}
                    photoUrl={c.otherImage}
                    className="h-10 w-10 shrink-0 rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {c.otherName}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {timeAgo(c.lastMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.lastMessage ?? "Sin mensajes"}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {c.unread > 9 ? "9+" : c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function ChatPanel({
  conv,
  onBack,
  onActivity,
}: {
  conv: ConversationListItem;
  onBack: () => void;
  onActivity: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [canSend, setCanSend] = useState(false);
  const [status, setStatus] = useState(conv.status);
  const [role, setRole] = useState(conv.role);
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<SendState, FormData>(
    sendMessage,
    {},
  );

  const refresh = useCallback(() => {
    fetch(`/api/chat/${conv.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ConversationView | null) => {
        if (!data) return;
        setMessages(data.messages);
        setCanSend(data.canSend);
        setStatus(data.status);
        setRole(data.role);
      })
      .catch(() => {});
  }, [conv.id]);

  // Carga inicial + polling de la conversación abierta.
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  // Tras enviar: limpiar, refrescar conversación y lista.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      refresh();
      onActivity();
    }
  }, [state.ok, refresh, onActivity]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const guestPending = status === "pending" && role === "guest";

  return (
    <>
      <header className="flex items-center gap-2 border-b px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
          aria-label="Volver"
        >
          <Icon name="chevronRight" className="h-5 w-5 rotate-180" />
        </button>
        <Avatar
          name={conv.otherName}
          photoUrl={conv.otherImage}
          className="h-9 w-9 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {conv.otherName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {role === "owner" ? "Sobre tu anuncio" : conv.profile.nickname}
          </p>
        </div>
        <Link
          href={`/mensajes/${conv.id}`}
          className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
          aria-label="Abrir conversación completa"
          title="Abrir en página completa"
        >
          <Icon name="expand" className="h-4 w-4" />
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="m-auto text-xs text-muted-foreground">
            No hay mensajes todavía.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${
                m.mine
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted"
              }`}
            >
              <p className="whitespace-pre-line break-words">{m.body}</p>
              <p
                className={`mt-0.5 text-[9px] ${
                  m.mine
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t p-2.5">
        {guestPending ? (
          <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-center text-[11px] text-amber-600">
            Mensaje enviado. Podrás seguir escribiendo cuando te respondan.
          </p>
        ) : !canSend ? (
          <p className="px-3 py-2 text-center text-[11px] text-muted-foreground">
            No puedes escribir en esta conversación.
          </p>
        ) : (
          <form ref={formRef} action={action} className="flex items-end gap-2">
            <input type="hidden" name="conversationId" value={conv.id} />
            <Textarea
              name="body"
              rows={1}
              maxLength={2000}
              placeholder="Escribe un mensaje…"
              className="min-h-9 flex-1 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={pending}
              aria-label="Enviar"
            >
              <Icon name="send" className="h-5 w-5" />
            </Button>
          </form>
        )}
        {state.error && (
          <p className="mt-1.5 text-center text-[11px] font-medium text-destructive">
            {state.error}
          </p>
        )}
      </div>
    </>
  );
}
