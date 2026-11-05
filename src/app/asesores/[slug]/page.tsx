import { Suspense } from "react";
import { DetailSkeleton } from "@/components/layout/detail-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Mail, MapPin, Phone } from "lucide-react";
import { AgentAvatar } from "@/components/agent/agent-avatar";
import { PropertyCard } from "@/components/property/property-card";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { LeadForm } from "@/components/forms/lead-form";
import { getAgentBySlug, getAgents, getPropertiesByAgent } from "@/lib/repo";

export async function generateStaticParams() {
  return (await getAgents()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/asesores/[slug]">): Promise<Metadata> {
  const a = await getAgentBySlug((await params).slug);
  if (!a) return {};
  return {
    title: `${a.name}, ${a.title}`,
    description: `${a.title} en MNU Realty. Zonas: ${a.zones.join(", ")}.`,
    alternates: { canonical: `/asesores/${a.slug}` },
  };
}

// El contenido depende del slug de la URL: se envuelve en Suspense para que la
// navegación muestre el esqueleto al instante mientras carga.
export default function Page({ params }: PageProps<"/asesores/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <AgentPage params={params} />
    </Suspense>
  );
}

async function AgentPage({ params }: { params: PageProps<"/asesores/[slug]">["params"] }) {
  const agent = await getAgentBySlug((await params).slug);
  if (!agent) notFound();
  const properties = await getPropertiesByAgent(agent.id);
  const active = properties.filter((p) => p.status === "disponible" || p.status === "apartada");

  return (
    <>
      <section className="bg-ink text-ivory">
        <div className="container-x grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <AgentAvatar agent={agent} size={120} />
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">{agent.title}</p>
              <h1 className="mt-2 font-display text-4xl sm:text-5xl">{agent.name}</h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ivory/70">
                <span className="flex items-center gap-1.5"><Award className="size-4 text-gold" />{agent.yearsExperience} años de experiencia</span>
                <span className="flex items-center gap-1.5"><MapPin className="size-4 text-gold" />{agent.zones.join(" · ")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <WhatsAppButton
              number={agent.whatsapp}
              agentId={agent.id}
              message={`Hola ${agent.name}, vi tu perfil en MNU Realty y me gustaría recibir asesoría.`}
              label="Escribir por WhatsApp"
            />
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="btn border border-white/20 text-ivory hover:bg-white/10"><Phone className="size-4" />Llamar</a>
            )}
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="btn border border-white/20 text-ivory hover:bg-white/10"><Mail className="size-4" />Correo</a>
            )}
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="text-lg font-semibold">Sobre mí</h2>
            <p className="mt-3 leading-relaxed text-ink/85">{agent.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {agent.specialties.map((s) => (
                <span key={s} className="rounded-full border border-gold/40 bg-gold-light/30 px-3 py-1 text-xs font-medium text-gold-deep">{s}</span>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl">Propiedades</h2>
              <span className="text-sm text-muted">{active.length} disponibles</span>
            </div>
            {properties.length === 0 ? (
              <p className="mt-4 text-muted">Este asesor aún no tiene propiedades publicadas.</p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} agent={agent} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-[88px] lg:self-start">
          <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-line/60">
            <h2 className="font-semibold">Contacta a {agent.name.split(" ")[0]}</h2>
            <p className="mt-1 mb-4 text-sm text-muted">Te responde directamente, sin intermediarios.</p>
            <LeadForm agentId={agent.id} submitLabel="Enviar mensaje" />
          </div>
          <Link href="/asesores" className="mt-4 block text-center text-sm text-muted hover:text-ink">← Ver todos los asesores</Link>
        </aside>
      </div>
    </>
  );
}
