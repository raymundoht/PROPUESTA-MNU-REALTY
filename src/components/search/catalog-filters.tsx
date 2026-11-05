"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { P } from "@/lib/filters";
import { typeLabel } from "@/lib/format";
import type { PropertyType } from "@/lib/types";

interface Props {
  cities: string[];
  amenities: string[];
  /** En /propiedades/venta y /renta la operación viene fija por la ruta. */
  fixedOperation?: boolean;
}

const types = Object.entries(typeLabel) as [PropertyType, string][];
const FILTER_KEYS = [P.operation, P.type, P.city, P.q, P.minPrice, P.maxPrice, P.beds, P.baths, P.minM2, P.amenity];

export function CatalogFilters({ cities, amenities, fixedOperation }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const activeCount = FILTER_KEYS.filter((k) => sp.get(k)).length;

  function apply(form: FormData) {
    const next = new URLSearchParams();
    for (const k of FILTER_KEYS) {
      const v = String(form.get(k) ?? "").trim();
      if (v) next.set(k, v);
    }
    for (const k of [P.sort, P.view]) {
      const v = sp.get(k);
      if (v) next.set(k, v);
    }
    const qs = next.toString();
    setOpen(false);
    startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
  }

  function clear() {
    setOpen(false);
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  const v = (k: string) => sp.get(k) ?? "";

  const form = (
    <form action={apply} key={sp.toString()} className="space-y-5">
      {!fixedOperation && (
        <fieldset>
          <legend className="label">Operación</legend>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-sand p-1 text-sm">
            {[
              { value: "", label: "Todas" },
              { value: "venta", label: "Venta" },
              { value: "renta", label: "Renta" },
            ].map((o) => (
              <label key={o.value} className="cursor-pointer">
                <input type="radio" name={P.operation} value={o.value} defaultChecked={v(P.operation) === o.value} className="peer sr-only" />
                <span className="block rounded-lg py-1.5 text-center font-medium text-muted transition peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-gold/40">
                  {o.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label className="label" htmlFor="f-q">Colonia o zona</label>
        <input id="f-q" name={P.q} defaultValue={v(P.q)} placeholder="Ej. Juriquilla" className="field" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="f-tipo">Inmueble</label>
          <select id="f-tipo" name={P.type} defaultValue={v(P.type)} className="field">
            <option value="">Todos</option>
            {types.map(([val, l]) => <option key={val} value={val}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-ciudad">Ciudad</label>
          <select id="f-ciudad" name={P.city} defaultValue={v(P.city)} className="field">
            <option value="">Todas</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <span className="label">Precio (MXN)</span>
        <div className="grid grid-cols-2 gap-3">
          <input name={P.minPrice} defaultValue={v(P.minPrice)} inputMode="numeric" placeholder="Mínimo" className="field" aria-label="Precio mínimo" />
          <input name={P.maxPrice} defaultValue={v(P.maxPrice)} inputMode="numeric" placeholder="Máximo" className="field" aria-label="Precio máximo" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="f-rec">Recámaras</label>
          <select id="f-rec" name={P.beds} defaultValue={v(P.beds)} className="field">
            <option value="">Cualquiera</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-banos">Baños</label>
          <select id="f-banos" name={P.baths} defaultValue={v(P.baths)} className="field">
            <option value="">Cualquiera</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="f-m2">Superficie mín.</label>
          <input id="f-m2" name={P.minM2} defaultValue={v(P.minM2)} inputMode="numeric" placeholder="m²" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="f-amenidad">Característica</label>
          <select id="f-amenidad" name={P.amenity} defaultValue={v(P.amenity)} className="field">
            <option value="">Cualquiera</option>
            {amenities.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1" disabled={pending}>
          {pending ? "Buscando…" : "Aplicar filtros"}
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={clear} className="btn-ghost">
            Limpiar
          </button>
        )}
      </div>
    </form>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost w-full lg:hidden">
        <SlidersHorizontal className="size-4" />
        Filtros{activeCount > 0 && ` (${activeCount})`}
      </button>

      <aside className="hidden rounded-card bg-white p-5 shadow-card ring-1 ring-line/60 lg:block" aria-label="Filtros">
        {form}
      </aside>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal aria-label="Filtros">
          <button type="button" className="absolute inset-0 bg-ink/50" aria-label="Cerrar" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2" aria-label="Cerrar filtros">
                <X className="size-5" />
              </button>
            </div>
            {form}
          </div>
        </div>
      )}
    </>
  );
}
