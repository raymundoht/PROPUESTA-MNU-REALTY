import type { Metadata } from "next";
import { AgentCard } from "@/components/agent/agent-card";
import { getAgents, getPropertiesByAgent } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Asesores inmobiliarios",
  description: "Conoce a los asesores de MNU Realty y contacta directamente al especialista de tu zona.",
  alternates: { canonical: "/asesores" },
};

export default async function AgentsPage() {
  const agents = await getAgents();
  const counts = await Promise.all(agents.map((a) => getPropertiesByAgent(a.id).then((l) => l.length)));
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-x py-10 sm:py-14">
          <p className="eyebrow">Equipo</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Nuestros asesores</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Cada propiedad tiene un asesor responsable que te atiende de forma directa, desde la primera duda hasta la firma.
          </p>
        </div>
      </section>
      <div className="container-x grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((a, i) => (
          <AgentCard key={a.id} agent={a} count={counts[i]} />
        ))}
      </div>
    </>
  );
}
