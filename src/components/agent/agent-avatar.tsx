import Image from "next/image";
import type { Agent } from "@/lib/types";
import { initials } from "@/lib/format";

export function AgentAvatar({ agent, size = 56 }: { agent: Pick<Agent, "name" | "photoUrl">; size?: number }) {
  if (agent.photoUrl) {
    return (
      <Image
        src={agent.photoUrl}
        alt={agent.name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover ring-2 ring-gold/40"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-ink font-display text-gold-light ring-2 ring-gold/40"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials(agent.name)}
    </span>
  );
}
