"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";
import { typeLabelPlural } from "@/lib/format";
import type { HeroItem } from "@/lib/repo";
import type { Agent, Operation, Property, PropertyType } from "@/lib/types";
import { Hero3D } from "./hero-3d/hero-3d";

type OpFilter = "todas" | Operation;

const opTabs: { value: OpFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "renta", label: "Renta" },
];

const opSuffix: Record<OpFilter, string> = { todas: "en venta y renta", venta: "en venta", renta: "en renta" };

/** Cuántas tarjetas se muestran bajo el hero antes de mandar al catálogo. */
const PREVIEW = 9;

function OpToggle({ value, onChange, dark, className = "" }: { value: OpFilter; onChange: (v: OpFilter) => void; dark?: boolean; className?: string }) {
  return (
    <div
      role="radiogroup"
      aria-label="Operación"
      className={`inline-flex rounded-full p-1 ${className} ${dark ? "bg-white/10 ring-1 ring-white/10" : "bg-white ring-1 ring-line"}`}
    >
      {opTabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(t.value)}
            className={`flex-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              on ? (dark ? "bg-gold text-ink" : "bg-ink text-ivory") : dark ? "text-ivory/75 hover:text-ivory" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Hero de inicio: maqueta 3D de la propiedad destacada de cada tipo y un panel que funciona
 * como filtro (tipo + venta/renta) del inventario real, cuyos resultados se muestran justo debajo.
 */
export function HeroShowcase({ items, listings, agents }: { items: HeroItem[]; listings: Property[]; agents: Agent[] }) {
  const [index, setIndex] = useState(0);
  const [op, setOp] = useState<OpFilter>("todas");
  const [mode, setMode] = useState<"3d" | "photo">("3d");
  const [thumbs, setThumbs] = useState<Partial<Record<PropertyType, string>>>({});
  const item = items[index];
  const types = items.map((it) => it.type);
  const agentById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);

  const byOp = useMemo(() => (op === "todas" ? listings : listings.filter((p) => p.operation === op)), [listings, op]);
  const counts = useMemo(() => {
    const c: Partial<Record<PropertyType, number>> = {};
    for (const p of byOp) c[p.type] = (c[p.type] ?? 0) + 1;
    return c;
  }, [byOp]);

  if (!item) return null;

  const results = byOp.filter((p) => p.type === item.type);
  const label = typeLabelPlural[item.type];
  const catalogHref = `/propiedades${op === "todas" ? "" : `/${op}`}?tipo=${item.type}`;

  return (
    <>
      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink pt-[68px] lg:min-h-[max(100svh,760px)]">
        <h1 className="sr-only">MNU Realty: casas, departamentos, oficinas, terrenos, locales, bodegas y proyectos en venta y renta</h1>

        {/* Fondo: maqueta 3D en movimiento por tipo. Si no hay WebGL, la foto real de la propiedad. */}
        <div className="absolute inset-0 -z-20 overflow-hidden bg-[linear-gradient(180deg,#3f6ba8_0%,#8fb0d8_50%,#d9c3a4_100%)]" aria-hidden>
          {mode === "3d" ? (
            <Hero3D type={item.type} types={types} onThumbs={setThumbs} onError={() => setMode("photo")} />
          ) : (
            items.map((it, i) => {
              const on = i === index;
              return (
                <div
                  key={it.type}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-out-soft ${
                    on ? "scale-100 opacity-100" : "scale-[1.14] opacity-0"
                  }`}
                >
                  <div className={`absolute inset-0 ${on ? "animate-camera-drift" : ""}`}>
                    <Image src={it.image} alt="" fill priority={i === 0} quality={90} sizes="100vw" className="object-cover" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="container-x pb-6 lg:pb-10">
          {/* Filtro: lista vertical flotante en escritorio, tira horizontal en móvil. */}
          <div
            id="que-buscas"
            className="-mx-4 scroll-mt-24 sm:-mx-6 lg:absolute lg:top-[92px] lg:right-8 lg:mx-0 lg:w-[284px] lg:rounded-[22px] lg:bg-ink/55 lg:p-3 lg:shadow-float lg:ring-1 lg:ring-white/10 lg:backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 px-4 pb-3 sm:px-6 lg:px-1 lg:pt-1">
              <p className="hidden px-1 text-lg font-semibold text-ivory lg:block">¿Qué buscas?</p>
              <div className="self-start rounded-full bg-ink/50 backdrop-blur lg:self-stretch lg:bg-transparent">
                <OpToggle value={op} onChange={setOp} dark className="w-full" />
              </div>
            </div>
            <ul className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-1 sm:px-6 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:py-0">
              {items.map((it, i) => {
                const on = i === index;
                const n = counts[it.type] ?? 0;
                return (
                  <li key={it.type} className="shrink-0 snap-start">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-pressed={on}
                      className={`flex w-full items-center gap-3 rounded-[14px] p-1.5 pr-3 text-left text-sm font-medium transition-[background-color,box-shadow,color] duration-300 ${
                        on
                          ? "bg-white/15 text-ivory ring-2 ring-gold"
                          : "bg-ink/40 text-ivory/80 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 hover:text-ivory lg:bg-transparent lg:ring-0"
                      }`}
                    >
                      <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-[10px] bg-ink-2">
                        {thumbs[it.type] ? (
                          // eslint-disable-next-line @next/next/no-img-element -- miniatura generada en el navegador (data URL)
                          <img src={thumbs[it.type]} alt="" className="size-full object-cover" />
                        ) : mode === "photo" ? (
                          <Image src={it.image} alt="" fill sizes="64px" className="object-cover" />
                        ) : null}
                      </span>
                      <span className="whitespace-nowrap lg:flex-1">{typeLabelPlural[it.type]}</span>
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                          on ? "bg-gold text-ink" : "bg-white/10 text-ivory/70"
                        }`}
                      >
                        {n}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-5 flex justify-center lg:mt-0 lg:justify-start">
            <a
              href="#resultados"
              className="inline-flex items-center gap-2 rounded-full bg-ink/55 px-4 py-2 text-sm font-semibold text-ivory ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-ink/70"
            >
              <ArrowDown className="size-4" />
              Ver {results.length} {results.length === 1 ? "resultado" : "resultados"}
            </a>
          </div>
        </div>
      </section>

      {/* Resultados del filtro */}
      <section id="resultados" className="scroll-mt-20 border-b border-line bg-white">
        <div className="container-x py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">¿Qué buscas?</p>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                {label} {opSuffix[op]}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {results.length} {results.length === 1 ? "inmueble disponible" : "inmuebles disponibles"}
              </p>
            </div>
            <OpToggle value={op} onChange={setOp} />
          </div>

          {results.length > 0 ? (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.slice(0, PREVIEW).map((p) => (
                  <PropertyCard key={p.id} property={p} agent={agentById.get(p.agentId) ?? null} />
                ))}
              </div>
              {results.length > PREVIEW && (
                <div className="mt-10 flex justify-center">
                  <Link href={catalogHref} className="btn-primary group">
                    Ver las {results.length} en el catálogo
                    <ArrowRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="mt-8 rounded-card border border-dashed border-line px-6 py-12 text-center">
              <p className="font-semibold text-ink">
                Por ahora no hay {label.toLowerCase()} {opSuffix[op]}.
              </p>
              {op !== "todas" && (
                <button type="button" onClick={() => setOp(op === "venta" ? "renta" : "venta")} className="btn-ghost mt-4">
                  Ver {label.toLowerCase()} en {op === "venta" ? "renta" : "venta"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
