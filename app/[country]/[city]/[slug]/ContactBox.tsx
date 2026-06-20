"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { startChat } from "@/app/mensajes/actions";

export function ContactBox({
  profileId,
  nickname,
  path,
  isLoggedIn,
  isOwner,
  contactEmail,
  contactPhone,
  contactWhatsapp,
}: {
  profileId: string;
  nickname: string;
  path: string;
  isLoggedIn: boolean;
  isOwner: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const hasDirect = !!(contactEmail || contactPhone || contactWhatsapp);

  const whatsappHref = contactWhatsapp
    ? `https://wa.me/${contactWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola ${nickname}, te vi en citasaldia.com y me gustaría conocerte.`
      )}`
    : null;

  function send() {
    const text = body.trim();
    if (!text) return;
    start(async () => {
      const res = await startChat(profileId, text);
      if (res.ok) {
        toast.success("Mensaje enviado");
        router.push(`/mensajes/${res.conversationId}`);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">Contacto</h2>

      {/* Contacto directo */}
      {hasDirect && (
        <div className="space-y-2">
          {whatsappHref && (
            <Button asChild className="w-full justify-start gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="whatsapp" className="h-5 w-5" />
                WhatsApp
              </a>
            </Button>
          )}
          {contactPhone && (
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href={`tel:${contactPhone.replace(/\s+/g, "")}`}>
                <Icon name="phone" className="h-5 w-5" />
                {contactPhone}
              </a>
            </Button>
          )}
          {contactEmail && (
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href={`mailto:${contactEmail}`}>
                <Icon name="mail" className="h-5 w-5" />
                <span className="truncate">{contactEmail}</span>
              </a>
            </Button>
          )}
        </div>
      )}

      {/* Chat interno */}
      {!isOwner && (
        <>
          {!isLoggedIn ? (
            <Button asChild variant="secondary" className="w-full gap-2">
              <Link href={`/login?next=${encodeURIComponent(path)}`}>
                <Icon name="chat" className="h-5 w-5" />
                Inicia sesión para enviar un mensaje
              </Link>
            </Button>
          ) : !open ? (
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={() => setOpen(true)}
            >
              <Icon name="chat" className="h-5 w-5" />
              Enviar mensaje interno
            </Button>
          ) : (
            <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                Escríbele a {nickname}. Podrás enviar un único mensaje hasta que te
                responda.
              </p>
              <Textarea
                rows={3}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`Hola ${nickname}…`}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  onClick={send}
                  disabled={pending || !body.trim()}
                >
                  <Icon name="send" className="h-4 w-4" />
                  {pending ? "Enviando…" : "Enviar"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {isOwner && (
        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          Este es tu anuncio. Gestiona los mensajes recibidos en{" "}
          <Link href="/mensajes" className="font-medium text-primary hover:underline">
            tus mensajes
          </Link>
          .
        </p>
      )}
    </div>
  );
}
