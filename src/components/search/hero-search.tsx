"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { P } from "@/lib/filters";
import { typeLabel } from "@/lib/format";
import type { Operation, PropertyType } from "@/lib/types";

const types = Object.entries(typeLabel) as [PropertyType, string][];

const budgets: Record<Operation, { label: string; value: string }[]> = {
  venta: [
    { label: "Hasta $3 M", value: "3000000" },
    { label: "Hasta $5 M", value: "5000000" },
    { label: "Hasta $10 M", value: "10000000" },
    { label: "Hasta $20 M", value: "20000000" },
  ],
  renta: [
    { label: "Hasta $15,000", value: "15000" },
    { label: "Hasta $25,000", value: "25000" },
    { label: "Hasta $50,000", value: "50000" },
    { label: "Hasta $100,000", value: "100000" },
  ],
};

export function HeroSearch() {
  const router = useRouter();
  const [op, setOp] = useState<Operation>("venta");

  function submit(form: FormData) {
    const params = new URLSearchParams();
    for (const key of [P.q, P.type, P.maxPrice]) {
      const v = String(form.get(key) ?? "").trim();
      if (v) params.set(key, v);
    }
    const qs = params.toString();
    router.push(`/propiedades/${op}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="inline-flex rounded-t-2xl bg-white/95 p-1.5 pb-0 backdrop-blur" role="tablist" aria-label="Tipo de operación">
        {(["venta", "renta"] as const).map((o) => (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={op === o}
            onClick={() => setOp(o)}
            className={`relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              op === o ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {o === "venta" ? "Comprar" : "Rentar"}
            {op === o && <span className="absolute inset-x-4 -bottom-0 h-0.5 rounded-full bg-gold" />}
          </button>
        ))}
      </div>
      <form
        action={submit}
        className="grid gap-2 rounded-2xl rounded-tl-none bg-white/95 p-2.5 shadow-float backdrop-blur md:grid-cols-[1.6fr_1fr_1fr_auto]"
      >
        <label className="flex flex-col rounded-xl px-3.5 py-2 transition-colors focus-within:bg-ivory">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">Ubicación</span>
          <input
            name={P.q}
            placeholder="Ciudad, colonia o zona"
            className="bg-transparent py-0.5 text-[15px] text-ink outline-none placeholder:text-muted/70"
          />
        </label>
        <label className="flex flex-col rounded-xl px-3.5 py-2 transition-colors focus-within:bg-ivory md:border-l md:border-line md:rounded-l-none">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">Inmueble</span>
          <select name={P.type} className="-ml-1 bg-transparent py-0.5 text-[15px] text-ink outline-none" defaultValue="">
            <option value="">Todos</option>
            {types.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col rounded-xl px-3.5 py-2 transition-colors focus-within:bg-ivory md:border-l md:border-line md:rounded-l-none">
          <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">Presupuesto</span>
          <select key={op} name={P.maxPrice} className="-ml-1 bg-transparent py-0.5 text-[15px] text-ink outline-none" defaultValue="">
            <option value="">Cualquiera</option>
            {budgets[op].map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary h-full min-h-12 rounded-xl px-7 text-[15px]">
          <Search className="size-4" />
          Buscar
        </button>
      </form>
    </div>
  );
}
