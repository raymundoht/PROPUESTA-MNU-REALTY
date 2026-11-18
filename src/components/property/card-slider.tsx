"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MAX = 6;

/** Carrusel de fotos para tarjetas: deslizable en móvil, flechas al pasar el mouse en escritorio. */
export function CardSlider({
  images,
  alt,
  href,
  sizes,
  priority,
  dimmed,
}: {
  images: string[];
  alt: string;
  href: string;
  sizes: string;
  priority?: boolean;
  dimmed?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = images.slice(0, MAX);
  const count = slides.length;

  const go = (d: number) => {
    const el = track.current;
    if (!el) return;
    const next = (index + d + count) % count;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="group/slider relative z-[1] size-full">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {slides.map((src, i) => (
          <Link key={src} href={href} tabIndex={i === 0 ? undefined : -1} aria-label={i === 0 ? alt : undefined} className="relative size-full shrink-0 snap-center">
            <Image
              src={src}
              alt={i === 0 ? alt : ""}
              fill
              priority={priority && i === 0}
              sizes={sizes}
              draggable={false}
              className={`object-cover transition-transform duration-700 ease-out-soft group-hover/slider:scale-[1.03] ${dimmed ? "grayscale-[60%]" : ""}`}
            />
          </Link>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/55 to-transparent" />

      {count > 1 && (
        <>
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => go(d)}
              aria-label={d < 0 ? "Foto anterior" : "Foto siguiente"}
              className={`absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur transition-[opacity,background-color,scale] duration-300 ease-out-soft group-hover/slider:opacity-100 hover:bg-white focus-visible:opacity-100 active:scale-95 pointer-coarse:hidden ${
                d < 0 ? "left-3" : "right-3"
              }`}
            >
              {d < 0 ? <ChevronLeft className="size-4.5" /> : <ChevronRight className="size-4.5" />}
            </button>
          ))}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden>
            {slides.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full bg-white transition-[width,opacity] duration-300 ease-out-soft ${
                  i === index ? "w-5 opacity-100" : "w-1.5 opacity-60"
                }`}
              />
            ))}
          </div>
          <span className="pointer-events-none absolute right-3 bottom-2.5 rounded-full bg-ink/50 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums backdrop-blur">
            {index + 1}/{count}
          </span>
        </>
      )}
    </div>
  );
}
