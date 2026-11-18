"use client";

import { useEffect, useRef, useState } from "react";
import type { PropertyType } from "@/lib/types";
import type { HeroEngine } from "./engine";

const FADE_MS = 450;

/**
 * Lienzo WebGL del hero. Carga three.js solo en el navegador y después del primer pintado.
 * Si el dispositivo no soporta WebGL, avisa con onError para mostrar las fotos.
 */
export function Hero3D({
  type,
  types,
  onThumbs,
  onError,
}: {
  type: PropertyType;
  types: PropertyType[];
  onThumbs: (thumbs: Partial<Record<PropertyType, string>>) => void;
  onError: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<HeroEngine | null>(null);
  const shown = useRef<PropertyType | null>(null);
  const [visible, setVisible] = useState(false);
  const latest = useRef({ type, types, onThumbs, onError });
  useEffect(() => {
    latest.current = { type, types, onThumbs, onError };
  });

  // Arranque y limpieza del motor.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let cancelled = false;
    let cleanup = () => {};
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("./engine")
      .then(({ HeroEngine }) => {
        if (cancelled) return;
        const e = new HeroEngine(el, reduced);
        engine.current = e;
        const { type: first, types: all } = latest.current;
        latest.current.onThumbs(e.thumbnails(all));
        e.setScene(first);
        shown.current = first;
        e.start();
        setVisible(true);

        const ro = new ResizeObserver(() => e.resize());
        ro.observe(el.parentElement!);
        // Pausa cuando el hero no se ve, para no gastar batería.
        const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? e.start() : e.stop()));
        io.observe(el);
        const onMove = (ev: PointerEvent) => {
          if (ev.pointerType !== "mouse") return;
          e.setPointer((ev.clientX / window.innerWidth) * 2 - 1, (ev.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", onMove);
        cleanup = () => {
          ro.disconnect();
          io.disconnect();
          window.removeEventListener("pointermove", onMove);
          e.dispose();
          engine.current = null;
        };
      })
      .catch(() => latest.current.onError());

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  // Cambio de escena: se desvanece, cambia y la cámara entra con un acercamiento.
  useEffect(() => {
    const e = engine.current;
    if (!e || shown.current === type) return;
    setVisible(false);
    const id = setTimeout(() => {
      e.setScene(type);
      shown.current = type;
      setVisible(true);
    }, FADE_MS);
    return () => clearTimeout(id);
  }, [type]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={`absolute inset-0 size-full transition-opacity ease-out-soft ${visible ? "opacity-100 duration-700" : "opacity-0 duration-[450ms]"}`}
    />
  );
}
