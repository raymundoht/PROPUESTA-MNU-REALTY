import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Agent } from "@/lib/types";
import { AgentAvatar } from "./agent-avatar";

export function AgentCard({ agent, count }: { agent: Agent; count?: number }) {
  return (
    <article className="group relative flex flex-col rounded-card bg-white p-6 shadow-card ring-1 ring-line/60 transition-shadow duration-300 hover:shadow-float">
      <div className="flex items-start justify-between">
        <AgentAvatar agent={agent} size={64} />
        <ArrowUpRight className="size-5 text-muted transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-deep" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">
        <Link href={`/asesores/${agent.slug}`} className="after:absolute after:inset-0">
          {agent.name}
        </Link>
      </h3>
      <p className="text-sm text-muted">{agent.title}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.zones.map((z) => (
          <span key={z} className="rounded-full bg-ivory px-2.5 py-1 text-xs text-ink/80">{z}</span>
        ))}
      </div>
      {count != null && (
        <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
          <span className="font-semibold text-ink">{count}</span> {count === 1 ? "propiedad" : "propiedades"}
        </p>
      )}
    </article>
  );
}
