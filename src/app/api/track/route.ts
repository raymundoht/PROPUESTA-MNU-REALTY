import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

// Eventos de interacción para las estadísticas de asesores y administración.
// Nota: un "whatsapp_click" solo indica que se abrió el enlace, no que se envió un mensaje.
const Event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("whatsapp_click"), agentId: z.string().max(64), propertyId: z.string().max(64).optional() }),
  z.object({ type: z.literal("property_view"), agentId: z.string().max(64), propertyId: z.string().max(64) }),
  z.object({ type: z.literal("share"), propertyId: z.string().max(64) }),
]);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`track:${ip}`, 60, 60_000)) return new NextResponse(null, { status: 204 });

  const parsed = Event.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  // TODO(Fase 2): INSERT INTO events (agency_id, type, property_id, agent_id, created_at)
  if (process.env.NODE_ENV !== "production") console.info("[track]", parsed.data);
  return new NextResponse(null, { status: 204 });
}
