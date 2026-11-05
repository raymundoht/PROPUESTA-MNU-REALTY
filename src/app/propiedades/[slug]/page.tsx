import { Suspense } from "react";
import { DetailSkeleton } from "@/components/layout/detail-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Phone } from "lucide-react";
import { Gallery } from "@/components/property/gallery";
import { OperationBadge, StatusBadge } from "@/components/property/badges";
import { PropertyActions, ViewTracker } from "@/components/property/property-actions";
import { LocationMap } from "@/components/property/location-map";
import { PropertyCard } from "@/components/property/property-card";
import { WhatsAppButton } from "@/components/property/whatsapp-button";
import { LeadForm } from "@/components/forms/lead-form";
import { AgentAvatar } from "@/components/agent/agent-avatar";
import { getAgentById, getAgents, getAllPropertySlugs, getPropertyBySlug, getSimilarProperties } from "@/lib/repo";
import { formatPrice, propertyUrl, statusLabel, typeLabel, whatsappMessage } from "@/lib/format";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  return (await getAllPropertySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/propiedades/[slug]">): Promise<Metadata> {
  const p = await getPropertyBySlug((await params).slug);
  if (!p) return {};
  const description = `${typeLabel[p.type]} ${p.operation === "venta" ? "en venta" : "en renta"} en ${p.colonia}, ${p.city}. ${formatPrice(p)}.`;
  return {
    title: p.title,
    description,
    alternates: { canonical: `/propiedades/${p.slug}` },
    openGraph: { title: p.title, description, images: [{ url: p.images[0] }], url: `/propiedades/${p.slug}` },
  };
}

// El contenido depende del slug de la URL: se envuelve en Suspense para que la
// navegación muestre el esqueleto al instante mientras carga.
export default function Page({ params }: PageProps<"/propiedades/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PropertyPage params={params} />
    </Suspense>
  );
}

async function PropertyPage({ params }: { params: PageProps<"/propiedades/[slug]">["params"] }) {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) notFound();
  const [agent, similar, agents] = await Promise.all([getAgentById(p.agentId), getSimilarProperties(p), getAgents()]);
  const agentById = new Map(agents.map((a) => [a.id, a]));
  const inactive = p.status === "vendida" || p.status === "rentada";
  const url = propertyUrl(p);

  const facts = [
    { label: "Tipo", value: typeLabel[p.type] },
    { label: "Operación", value: p.operation === "venta" ? "Venta" : "Renta" },
    { label: "Estado", value: statusLabel[p.status] },
    p.bedrooms != null && { label: "Recámaras", value: p.bedrooms },
    p.bathrooms != null && { label: "Baños", value: p.bathrooms },
    p.parking != null && { label: "Estacionamientos", value: p.parking },
    p.constructionM2 != null && { label: "Construcción", value: `${p.constructionM2} m²` },
    p.landM2 != null && { label: "Terreno", value: `${p.landM2} m²` },
  ].filter(Boolean) as { label: string; value: string | number }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url,
    image: p.images,
    datePosted: p.publishedAt,
    offers: { "@type": "Offer", price: p.price, priceCurrency: p.currency, availability: inactive ? "https://schema.org/SoldOut" : "https://schema.org/InStock" },
    address: { "@type": "PostalAddress", addressLocality: p.city, addressRegion: p.state, addressCountry: "MX" },
  };

  return (
    <>
      <ViewTracker propertyId={p.id} agentId={p.agentId} />
      {!site.demoMode && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <div className="container-x pt-6 pb-16">
        <nav className="flex items-center gap-1 text-xs text-muted print:hidden" aria-label="Ruta">
          <Link href="/propiedades" className="hover:text-ink">Propiedades</Link>
          <ChevronRight className="size-3" />
          <Link href={`/propiedades/${p.operation}`} className="hover:text-ink">{p.operation === "venta" ? "Venta" : "Renta"}</Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-ink">{p.title}</span>
        </nav>

        <header className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex gap-1.5">
              <OperationBadge op={p.operation} />
              <StatusBadge status={p.status} />
            </div>
            <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-[2.6rem]">{p.title}</h1>
            <p className="mt-2 text-muted">{p.colonia}, {p.city}, {p.state}</p>
          </div>
          <div className="lg:text-right">
            <p className="font-display text-3xl text-ink sm:text-4xl">{formatPrice(p)}</p>
            <div className="mt-3 lg:flex lg:justify-end">
              <PropertyActions id={p.id} title={p.title} url={url} />
            </div>
          </div>
        </header>

        <div className="mt-6">
          <Gallery images={p.images} title={p.title} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="text-lg font-semibold">Características</h2>
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line ring-1 ring-line sm:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label} className="bg-white p-4">
                    <dt className="text-xs text-muted">{f.label}</dt>
                    <dd className="mt-1 font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Descripción</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/85">{p.description}</p>
            </section>

            {p.amenities.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">Amenidades</h2>
                <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {p.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2.5 text-sm">
                      <span className="grid size-6 place-items-center rounded-full bg-gold-light/60">
                        <Check className="size-3.5 text-gold-deep" strokeWidth={2.5} />
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold">Ubicación</h2>
              <div className="mt-3">
                <LocationMap p={p} />
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-line/60">
              {agent && (
                <>
                  <div className="flex items-center gap-4">
                    <AgentAvatar agent={agent} size={60} />
                    <div className="min-w-0">
                      <p className="text-xs text-muted">Asesor responsable</p>
                      <p className="truncate font-semibold">{agent.name}</p>
                      <Link href={`/asesores/${agent.slug}`} className="text-xs font-medium text-gold-deep hover:underline">
                        Ver perfil
                      </Link>
                    </div>
                  </div>
                  {!inactive && (
                    <div className="mt-5 grid gap-2">
                      <WhatsAppButton
                        number={agent.whatsapp}
                        message={whatsappMessage(p)}
                        agentId={agent.id}
                        propertyId={p.id}
                        label="Solicitar información por WhatsApp"
                        className="w-full"
                      />
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`} className="btn-ghost w-full">
                          <Phone className="size-4" />
                          Llamar
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className="mt-6 border-t border-line pt-6 print:hidden">
                {inactive ? (
                  <p className="text-sm text-muted">
                    Esta propiedad ya fue {p.status}. Revisa <Link href={`/propiedades/${p.operation}`} className="font-medium text-gold-deep underline">propiedades similares</Link>.
                  </p>
                ) : (
                  <>
                    <p className="mb-3 text-sm font-semibold">O déjanos tus datos</p>
                    <LeadForm
                      propertyId={p.id}
                      agentId={p.agentId}
                      allowVisit
                      defaultMessage={`Hola, me interesa la propiedad "${p.title}".`}
                    />
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20 print:hidden">
            <h2 className="font-display text-3xl">Propiedades similares</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} property={s} agent={agentById.get(s.agentId) ?? null} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
