import type { Availability, Operation } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function OperationBadge({ op, className = "" }: { op: Operation; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
        op === "venta" ? "bg-sale text-white" : "bg-rent text-white"
      } ${className}`}
    >
      {op === "venta" ? "Venta" : "Renta"}
    </span>
  );
}

export function StatusBadge({ status, className = "" }: { status: Availability; className?: string }) {
  if (status === "disponible") return null;
  const tone = status === "apartada" ? "bg-brand-yellow text-ink" : "bg-ink text-ivory";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${tone} ${className}`}>
      {statusLabel[status]}
    </span>
  );
}
