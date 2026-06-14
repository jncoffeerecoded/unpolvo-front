"use client";

import { useState, useTransition } from "react";
import { startVerification } from "./actions";
import { Icon } from "@/components/icons";

export function VerifyButton() {
  const [msg, setMsg] = useState<string>();
  const [pending, start] = useTransition();

  function onClick() {
    start(async () => {
      const r = await startVerification();
      if (r.url) {
        window.location.href = r.url;
      } else {
        setMsg(r.message);
      }
    });
  }

  return (
    <div>
      <button
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 font-medium text-white transition hover:bg-sky-700 disabled:opacity-60"
      >
        <Icon name="scanFace" className="h-5 w-5" />
        {pending ? "Iniciando…" : "Verificar mi identidad"}
      </button>
      {msg && (
        <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {msg}
        </p>
      )}
    </div>
  );
}
