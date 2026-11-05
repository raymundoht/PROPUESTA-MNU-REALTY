import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Home, LandPlot, Map as MapIcon, MessageCircle, ShieldCheck, Store, Briefcase, UserRound } from "lucide-react";
import { HeroSearch } from "@/components/search/hero-search";
import { PropertyCard } from "@/components/property/property-card";
import { AgentCard } from "@/components/agent/agent-card";
import { LeadForm } from "@/components/forms/lead-form";
import { getAgents, getCities, getFeaturedProperties, getRecentProperties, getTypeCounts } from "@/lib/repo";
import { HERO_IMAGE } from "@/lib/demo-data";
import { typeLabelPlural } from "@/lib/format";
import type { PropertyType } from "@/lib/types";

const typeIcons: Record<PropertyType, typeof Home> = {
  casa: Home,
  departamento: Building2,
  terreno: LandPlot,
  local: Store,
  oficina: Briefcase,
};

function SectionHeader({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          {cta}
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [featured, recent, agents, cities, typeCounts] = await Promise.all([
    getFeaturedProperties(3),
    getRecentProperties(6),
    getAgents(),
    getCities(),
    getTypeCounts(),
  ]);
  const agentById = new Map(agents.map((a) => [a.id, a]));
  const types = (Object.keys(typeLabelPlural) as PropertyType[]).filter((t) => typeCounts[t]);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-ink pt-[68px] sm:min-h-[720px] lg:min-h-[86vh]">
        <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(21_21_18/0.55)_0%,rgb(21_21_18/0.15)_35%,rgb(21_21_18/0.75)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(21_21_18/0.6)_0%,rgb(21_21_18/0.2)_55%,transparent_100%)]" />
        <div className="container-x pb-14 sm:pb-20">
          <p className="text-xs font-semibold tracking-[0.22em] text-gold-light uppercase">MNU Realty</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.6rem] leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
            El lugar correcto, con la persona correcta.
          </h1>
          <p className="mt-5 max-w-xl text-base text-ivory/80 sm:text-lg">
            Casas, departamentos, terrenos y locales en venta y renta. Habla directo con el asesor de cada propiedad.
          </p>
          <div className="mt-9">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Destacadas */}
      {featured.length > 0 && (
        <section className="container-x py-20 sm:py-24">
          <SectionHeader eyebrow="Selección" title="Propiedades destacadas" href="/propiedades" cta="Ver catálogo" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} agent={agentById.get(p.agentId) ?? null} />
            ))}
          </div>
        </section>
      )}

      {/* Por tipo */}
      <section className="border-y border-line bg-white">
        <div className="container-x py-16 sm:py-20">
          <SectionHeader eyebrow="Explora" title="¿Qué estás buscando?" />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {types.map((t) => {
              const Icon = typeIcons[t];
              return (
                <Link
                  key={t}
                  href={`/propiedades?tipo=${t}`}
                  className="group flex flex-col justify-between rounded-card border border-line bg-ivory/60 p-5 transition-colors duration-300 hover:border-gold/60 hover:bg-ivory"
                >
                  <Icon className="size-7 text-gold-deep" strokeWidth={1.5} />
                  <div className="mt-8">
                    <p className="font-semibold">{typeLabelPlural[t]}</p>
                    <p className="text-xs text-muted">{typeCounts[t]} disponibles</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Por ubicación */}
      <section className="container-x py-20 sm:py-24">
        <SectionHeader eyebrow="Ubicaciones" title="Explora por ciudad" />
        <div className="mt-10 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.slice(0, 4).map((c, i) => (
            <Link
              key={c.city}
              href={`/propiedades?ciudad=${encodeURIComponent(c.city)}`}
              className={`group relative overflow-hidden rounded-card bg-ink ${i === 0 ? "sm:row-span-2 lg:col-span-2" : i === 1 ? "lg:col-span-2" : ""}`}
            >
              <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-80 transition duration-700 ease-out-soft group-hover:scale-[1.04] group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                <p className="font-display text-2xl sm:text-3xl">{c.city}</p>
                <p className="text-sm text-ivory/75">{c.state} · {c.count} {c.count === 1 ? "propiedad" : "propiedades"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recientes */}
      <section className="bg-sand/60">
        <div className="container-x py-20 sm:py-24">
          <SectionHeader eyebrow="Novedades" title="Recién publicadas" href="/propiedades" cta="Ver todas" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((p) => (
              <PropertyCard key={p.id} property={p} agent={agentById.get(p.agentId) ?? null} />
            ))}
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section className="container-x py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-ivory sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <MapIcon className="size-8 text-gold" strokeWidth={1.5} />
              <h2 className="mt-5 font-display text-3xl sm:text-4xl">Busca sobre el mapa</h2>
              <p className="mt-3 max-w-lg text-ivory/70">
                Mira todas las propiedades por zona, con el precio en cada marcador. Verde para venta, azul para renta.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <span className="rounded-full bg-sale px-3.5 py-1.5 text-sm font-semibold shadow-lg">$3.5 M · Venta</span>
              <span className="rounded-full bg-rent px-3.5 py-1.5 text-sm font-semibold shadow-lg">$18,000 · Renta</span>
              <Link href="/mapa" className="btn-gold">Abrir mapa</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Asesores */}
      <section className="border-t border-line bg-white">
        <div className="container-x py-20 sm:py-24">
          <SectionHeader eyebrow="Equipo" title="Asesores que te atienden directo" href="/asesores" cta="Conocer al equipo" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agents.slice(0, 4).map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros + contacto */}
      <section id="contacto" className="container-x grid gap-12 py-20 sm:py-24 lg:grid-cols-2">
        <div>
          <p className="eyebrow">MNU Realty</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Una forma más clara de comprar y rentar</h2>
          <ul className="mt-8 space-y-6">
            {[
              { icon: UserRound, t: "Un asesor por propiedad", d: "Siempre sabes con quién hablar y te responde quien conoce el inmueble." },
              { icon: MessageCircle, t: "Contacto inmediato", d: "Escribe por WhatsApp con los datos de la propiedad ya incluidos." },
              { icon: ShieldCheck, t: "Publicaciones revisadas", d: "Cada propiedad se aprueba antes de aparecer en el catálogo." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-light/50">
                  <Icon className="size-5 text-gold-deep" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-0.5 text-sm text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-line/60 sm:p-8">
          <h3 className="text-xl font-semibold">¿Quieres vender, rentar o comprar?</h3>
          <p className="mt-1 mb-5 text-sm text-muted">Déjanos tus datos y un asesor te contactará.</p>
          <LeadForm />
        </div>
      </section>
    </>
  );
}
