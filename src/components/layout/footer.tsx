import Link from "next/link";
import { Logo } from "./logo";
import { nav, site } from "@/lib/site";
import { typeLabelPlural } from "@/lib/format";
import type { PropertyType } from "@/lib/types";

const types: PropertyType[] = ["casa", "departamento", "terreno", "local", "oficina"];

export function Footer() {
  return (
    <footer className="bg-ink text-ivory/70">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo className="h-14 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{site.description}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Explorar</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition-colors hover:text-ivory">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Inmuebles</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {types.map((t) => (
              <li key={t}>
                <Link href={`/propiedades?tipo=${t}`} className="transition-colors hover:text-ivory">
                  {typeLabelPlural[t]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© MNU Realty. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            <Link href="/contacto" className="hover:text-ivory">Contacto</Link>
            <Link href="/login" className="hover:text-ivory">Acceso asesores</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
