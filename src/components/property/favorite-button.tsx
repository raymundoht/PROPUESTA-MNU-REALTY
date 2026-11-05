"use client";

import { Heart } from "lucide-react";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

export function FavoriteButton({ id, className = "", withLabel = false }: { id: string; className?: string; withLabel?: boolean }) {
  const favs = useFavorites();
  const active = favs.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      }}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={className}
    >
      <Heart
        className={`size-[18px] transition-transform duration-200 ease-out-soft ${active ? "scale-110 fill-red-500 text-red-500" : ""}`}
      />
      {withLabel && <span>{active ? "Guardada" : "Guardar"}</span>}
    </button>
  );
}
