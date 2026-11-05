"use client";

export type TrackEvent =
  | { type: "whatsapp_click"; propertyId?: string; agentId: string }
  | { type: "property_view"; propertyId: string; agentId: string }
  | { type: "share"; propertyId: string };

/** Registro de interacciones. Un clic en WhatsApp NO confirma que se envió un mensaje. */
export function track(event: TrackEvent) {
  try {
    const body = JSON.stringify(event);
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {}
}
