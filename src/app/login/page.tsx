import type { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = { title: "Acceso asesores", robots: { index: false } };

// El inicio de sesión (asesores y administradores) llega en la Fase 2.
export default function LoginPage() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-14">
      <div className="w-full max-w-sm rounded-card bg-white p-8 text-center shadow-card ring-1 ring-line/60">
        <Lock className="mx-auto size-8 text-gold-deep" strokeWidth={1.5} />
        <h1 className="mt-4 text-xl font-semibold">Acceso para asesores</h1>
        <p className="mt-2 text-sm text-muted">
          El panel de asesores y administración estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
