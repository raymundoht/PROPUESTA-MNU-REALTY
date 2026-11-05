"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { nav } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  // El menú móvil se cierra solo al cambiar de página.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        overHero ? "bg-transparent" : "bg-ink/95 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur"
      } ${pathname === "/" ? "-mb-[68px]" : ""}`}
    >
      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        <Logo className="h-9 w-auto" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "text-gold-light" : "text-ivory/80 hover:text-ivory"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/favoritos" className="rounded-full p-2 text-ivory/80 transition-colors hover:text-ivory" aria-label="Favoritos">
            <Heart className="size-5" />
          </Link>
          <Link href="/contacto" className="btn-gold">
            Contáctanos
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpenAt(open ? null : pathname)}
          className="rounded-full p-2 text-ivory md:hidden"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-ink md:hidden" aria-label="Móvil">
          <div className="container-x flex flex-col py-3">
            {[...nav, { href: "/favoritos", label: "Favoritos" }, { href: "/contacto", label: "Contacto" }].map((item) => (
              <Link key={item.href} href={item.href} className="py-3 text-base font-medium text-ivory/90">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
