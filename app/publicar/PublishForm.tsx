"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getDict } from "@/lib/i18n";
import { GENDERS, GENDER_ICON, BODY_TYPES, BODY_TYPE_ICON } from "@/lib/attributes";

type Country = { code: string; name: string; cities: { slug: string; name: string }[] };

const SELECT =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const CHOICE =
  "flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-input p-3 text-center text-sm text-muted-foreground transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

type CreateState = { error?: string; fieldErrors?: Record<string, string> };

export function PublishForm({ countries }: { countries: Country[] }) {
  const d = getDict("es");
  const router = useRouter();
  const [state, setState] = useState<CreateState>({});
  const [pending, setPending] = useState(false);
  const [countryCode, setCountryCode] = useState(countries[0]?.code ?? "");
  const [previews, setPreviews] = useState<string[]>([]);
  const cities = countries.find((c) => c.code === countryCode)?.cities ?? [];
  const err = state.fieldErrors ?? {};

  // Envío por fetch (no Server Action): la respuesta es JSON limpio y el
  // formulario NO se resetea al fallar la validación.
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    setPending(true);
    setState({});
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        body: new FormData(form),
      });
      const body = (await res.json().catch(() => ({}))) as CreateState & {
        path?: string;
      };
      if (res.ok && body.path) {
        toast.success("¡Perfil publicado!");
        router.push(body.path);
        return; // navegamos: dejamos pending activo hasta desmontar
      }
      setState({
        error: body.error ?? "No se pudo publicar.",
        fieldErrors: body.fieldErrors,
      });
    } catch {
      setState({ error: "No se pudo conectar. Inténtalo de nuevo." });
    }
    setPending(false);
  }

  // Al fallar la validación: toast + scroll al primer campo con error.
  useEffect(() => {
    if (!state.error && !state.fieldErrors) return;
    const fe = state.fieldErrors ?? {};
    const order = [
      "title",
      "nickname",
      "bio",
      "age",
      "gender",
      "countryCode",
      "citySlug",
      "contactEmail",
      "contactPhone",
      "contactWhatsapp",
      "bodyType",
      "photoFiles",
    ];
    const first = order.find((f) => fe[f]);
    toast.error(state.error ?? "Revisa los campos marcados.", {
      description: first ? "Te llevamos al primer campo por corregir." : undefined,
    });
    if (first) {
      const el = (document.getElementById(first) ??
        document.querySelector(`[name="${first}"]`)) as HTMLElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.({ preventScroll: true });
    }
  }, [state]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {state.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </div>
      )}

      <Section title="Sobre tu anuncio">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" placeholder="Ej. Conozcamos la ciudad juntos" maxLength={80} />
          <FieldError msg={err.title} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nickname">Apodo</Label>
          <Input id="nickname" name="nickname" placeholder="Ej. Ana" maxLength={40} />
          <FieldError msg={err.nickname} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Cuéntanos algo de ti</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={5}
            placeholder="Tus aficiones, qué te gusta, qué tipo de gente quieres conocer…"
            maxLength={2000}
          />
          <FieldError msg={err.bio} />
        </div>
      </Section>

      <Section title="Tus datos">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="age">Edad</Label>
            <Input id="age" name="age" type="number" min={18} max={99} placeholder="18+" />
            <FieldError msg={err.age} />
          </div>
        </div>

        <div>
          <span className="text-sm font-medium">Género</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {GENDERS.map((g) => (
              <label key={g}>
                <input type="radio" name="gender" value={g} className="peer sr-only" />
                <span className={CHOICE}>
                  <Icon name={GENDER_ICON[g]} className="h-6 w-6" />
                  {d.gender[g]}
                </span>
              </label>
            ))}
          </div>
          <FieldError msg={err.gender} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="countryCode">País</Label>
            <select
              id="countryCode"
              name="countryCode"
              className={SELECT}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError msg={err.countryCode} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="citySlug">Ciudad</Label>
            <select key={countryCode} id="citySlug" name="citySlug" className={SELECT} defaultValue="">
              <option value="" disabled>
                Selecciona una ciudad
              </option>
              {cities.map((ci) => (
                <option key={ci.slug} value={ci.slug}>
                  {ci.name}
                </option>
              ))}
            </select>
            <FieldError msg={err.citySlug} />
          </div>
        </div>
      </Section>

      <Section
        title="Contacto"
        hint="Opcional. Decide cómo quieres que te contacten. Se mostrarán en tu anuncio."
      >
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Correo electrónico</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            inputMode="email"
            placeholder="tucorreo@ejemplo.com"
            maxLength={120}
          />
          <FieldError msg={err.contactEmail} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">Teléfono móvil</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              inputMode="tel"
              placeholder="+34 600 111 222"
            />
            <FieldError msg={err.contactPhone} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactWhatsapp">WhatsApp</Label>
            <Input
              id="contactWhatsapp"
              name="contactWhatsapp"
              type="tel"
              inputMode="tel"
              placeholder="+52 55 1234 5678"
            />
            <p className="text-xs text-muted-foreground">
              Con código de país. Abrirá un chat directo de WhatsApp.
            </p>
            <FieldError msg={err.contactWhatsapp} />
          </div>
        </div>
      </Section>

      <Section title="Atributos" hint="Opcional.">
        <div>
          <span className="text-sm font-medium">Complexión</span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BODY_TYPES.map((b) => (
              <label key={b}>
                <input type="radio" name="bodyType" value={b} className="peer sr-only" />
                <span className={CHOICE}>
                  <Icon name={BODY_TYPE_ICON[b]} className="h-7 w-7" />
                  {d.bodyType[b]}
                </span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Fotos" hint="Sube hasta 6 fotos (JPG, PNG, WEBP · máx. 5 MB cada una).">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-input p-8 text-center text-sm text-muted-foreground transition hover:border-primary/50">
          <Icon name="camera" className="h-8 w-8 text-primary" />
          <span>
            <span className="font-medium text-foreground">Haz clic para subir</span> o
            arrastra tus fotos
          </span>
          <input
            type="file"
            name="photoFiles"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={onFiles}
          />
        </label>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`Foto ${i + 1}`}
                className="aspect-square w-full rounded-lg object-cover ring-1 ring-border"
              />
            ))}
          </div>
        )}
        <FieldError msg={err.photoFiles} />
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Al publicar confirmas que eres mayor de 18 años y que el contenido es tuyo.
        </p>
        <Button type="submit" disabled={pending} className="h-11 rounded-full px-6">
          <Icon name="sparkles" className="h-5 w-5" />
          {pending ? "Publicando…" : "Publicar perfil"}
        </Button>
      </div>
    </form>
  );
}
