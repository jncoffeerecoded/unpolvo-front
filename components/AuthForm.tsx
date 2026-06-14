"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  loginWithCredentials,
  registerUser,
  type AuthState,
} from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "register";
  next: string;
}) {
  const action = mode === "login" ? loginWithCredentials : registerUser;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        {mode === "register" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="Tu nombre" required />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={mode === "register" ? "Mínimo 8 caracteres" : "••••••••"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </div>

        {state.error && (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending
            ? "Un momento…"
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
