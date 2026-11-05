"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Grid2x2, X } from "lucide-react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, go]);

  const thumbs = images.slice(1, 5);

  return (
    <>
      <div className={`grid gap-2 overflow-hidden rounded-card ${thumbs.length ? "md:grid-cols-4 md:grid-rows-2" : ""} h-[300px] sm:h-[420px] lg:h-[520px]`}>
        <button
          type="button"
          onClick={() => setIndex(0)}
          className={`relative overflow-hidden bg-sand ${thumbs.length ? "md:col-span-2 md:row-span-2" : ""}`}
          aria-label="Ver fotografías"
        >
          <Image src={images[0]} alt={title} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out-soft hover:scale-[1.02]" />
        </button>
        {thumbs.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i + 1)}
            className={`relative hidden overflow-hidden bg-sand md:block ${thumbs.length < 3 ? "md:row-span-2" : ""}`}
            aria-label={`Ver fotografía ${i + 2}`}
          >
            <Image src={src} alt="" fill sizes="25vw" className="object-cover transition-transform duration-700 ease-out-soft hover:scale-[1.04]" />
          </button>
        ))}
      </div>
      {count > 1 && (
        <button type="button" onClick={() => setIndex(0)} className="btn-ghost mt-3 print:hidden">
          <Grid2x2 className="size-4" />
          Ver las {count} fotografías
        </button>
      )}

      {index !== null && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-ink/95" role="dialog" aria-modal aria-label="Galería">
          <div className="flex items-center justify-between p-4 text-ivory">
            <span className="text-sm">
              {index + 1} / {count}
            </span>
            <button type="button" onClick={() => setIndex(null)} className="rounded-full p-2 hover:bg-white/10" aria-label="Cerrar galería">
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={images[index]} alt={`${title}, foto ${index + 1}`} fill sizes="100vw" className="object-contain" />
            {count > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 p-3 text-ivory hover:bg-white/20" aria-label="Anterior">
                  <ChevronLeft className="size-6" />
                </button>
                <button type="button" onClick={() => go(1)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 p-3 text-ivory hover:bg-white/20" aria-label="Siguiente">
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
