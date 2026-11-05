import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

// Solicitudes de información / visitas. En Fase 2 se guardan en la tabla `leads`
// (y `appointments` si es visita) y se notifica al asesor responsable.
const Lead = z.object({
  kind: z.enum(["informacion", "visita"]).default("informacion"),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+\d\s()-]{8,20}$/, "Teléfono no válido"),
  email: z.union([z.literal(""), z.email()]).optional(),
  message: z.string().trim().max(1000).optional(),
  preferredDate: z.union([z.literal(""), z.iso.date()]).optional(),
  propertyId: z.string().max(64).optional(),
  agentId: z.string().max(64).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`lead:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Lead.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos del formulario." }, { status: 400 });
  }
  const { website, ...lead } = parsed.data;
  if (website) return NextResponse.json({ ok: true }); // bot: se descarta en silencio

  // TODO(Fase 2): INSERT INTO leads (...) y notificación al asesor.
  console.info("[lead]", { ...lead, phone: "***", email: lead.email ? "***" : undefined });
  return NextResponse.json({ ok: true }, { status: 201 });
}
