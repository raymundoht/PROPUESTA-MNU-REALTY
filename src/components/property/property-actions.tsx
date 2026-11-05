"use client";

import { useEffect, useState } from "react";
import { Check, Printer, Share2 } from "lucide-react";
import { track } from "@/lib/track";
import { FavoriteButton } from "./favorite-button";

export function PropertyActions({ id, title, url }: { id: string; title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    track({ type: "share", propertyId: id });
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return; // el usuario canceló
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const btn = "btn-ghost px-4 py-2";
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={share} className={btn}>
        {copied ? <Check className="size-4 text-sale" /> : <Share2 className="size-4" />}
        {copied ? "Enlace copiado" : "Compartir"}
      </button>
      <FavoriteButton id={id} withLabel className={btn} />
      <button type="button" onClick={() => window.print()} className={btn}>
        <Printer className="size-4" />
        Ficha PDF
      </button>
    </div>
  );
}

/** Registra una visita a la ficha (una vez por carga). */
export function ViewTracker({ propertyId, agentId }: { propertyId: string; agentId: string }) {
  useEffect(() => {
    track({ type: "property_view", propertyId, agentId });
  }, [propertyId, agentId]);
  return null;
}
