"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Icon } from "./icons";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SITE_NAME } from "@/lib/seo";

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/notifications/count")
      .then((r) => r.json())
      .then((d) => active && setUnread(d.count ?? 0))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <Logo className="h-8 w-8" />
          {SITE_NAME}
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Button asChild size="sm">
            <Link href="/publicar">
              <Icon name="sparkles" className="h-4 w-4" />
              Publicar
            </Link>
          </Button>

          {status === "loading" ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative rounded-full"
              >
                <Link href="/notificaciones" aria-label="Notificaciones">
                  <Icon name="bell" className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="size-8">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.name ?? ""} />
                      ) : null}
                      <AvatarFallback>
                        {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="truncate">{user.name ?? "Mi cuenta"}</div>
                    <div className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta">
                      <Icon name="user" className="mr-2 h-4 w-4" />
                      Mis anuncios
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notificaciones">
                      <Icon name="bell" className="mr-2 h-4 w-4" />
                      Notificaciones
                      {unread > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {unread}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/verificacion">
                      <Icon name="shield-check" className="mr-2 h-4 w-4" />
                      Verificar mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/publicar">
                      <Icon name="sparkles" className="mr-2 h-4 w-4" />
                      Publicar perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
                    <Icon name="x" className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
