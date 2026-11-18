"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

type State = { ok: boolean; error?: string } | null;

interface Props {
  propertyId?: string;
  agentId?: string;
  defaultMessage?: string;
  /** Muestra la opción de agendar visita. */
  allowVisit?: boolean;
  submitLabel?: string;
}

// En la versión estática (GitHub Pages) no hay servidor que reciba el formulario.
const STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

async function send(_: State, form: FormData): Promise<State> {
  if (STATIC_SITE) {
    return { ok: false, error: "Versión de demostración: el formulario no envía datos. Escríbenos por WhatsApp desde la ficha de la propiedad." };
  }
  const body = Object.fromEntries(form.entries());
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "No pudimos enviar tu solicitud. Intenta de nuevo." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Sin conexión. Intenta de nuevo." };
  }
}

export function LeadForm({ propertyId, agentId, defaultMessage = "", allowVisit, submitLabel = "Enviar solicitud" }: Props) {
  const [state, action, pending] = useActionState(send, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-ivory px-5 py-8 text-center">
        <CheckCircle2 className="size-9 text-sale" strokeWidth={1.5} />
        <p className="mt-3 font-semibold">¡Gracias! Recibimos tu solicitud.</p>
        <p className="mt-1 text-sm text-muted">Un asesor se pondrá en contacto contigo pronto.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
      {agentId && <input type="hidden" name="agentId" value={agentId} />}
      {/* Campo trampa anti-spam: los humanos no lo ven. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {allowVisit && (
        <fieldset className="grid grid-cols-2 gap-1 rounded-xl bg-sand p-1 text-sm">
          <legend className="sr-only">Tipo de solicitud</legend>
          {[
            { v: "informacion", l: "Información" },
            { v: "visita", l: "Agendar visita" },
          ].map((o, i) => (
            <label key={o.v} className="cursor-pointer">
              <input type="radio" name="kind" value={o.v} defaultChecked={i === 0} className="peer sr-only" />
              <span className="block rounded-lg py-1.5 text-center font-medium text-muted transition peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-sm">
                {o.l}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Nombre" className="field" aria-label="Nombre" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="Teléfono" className="field" aria-label="Teléfono" />
        <input name="email" type="email" autoComplete="email" placeholder="Correo (opcional)" className="field" aria-label="Correo" />
      </div>
      {allowVisit && (
        <input name="preferredDate" type="date" className="field" aria-label="Fecha preferida para visita (opcional)" />
      )}
      <textarea name="message" rows={3} maxLength={1000} defaultValue={defaultMessage} placeholder="Mensaje" className="field resize-none" aria-label="Mensaje" />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Enviando…" : submitLabel}
      </button>
      <p className="text-center text-[11px] text-muted">Al enviar aceptas que un asesor te contacte sobre esta solicitud.</p>
    </form>
  );
}
