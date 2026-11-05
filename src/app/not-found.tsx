import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-14 text-center">
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">No encontramos esta página</h1>
        <p className="mt-3 text-muted">Es posible que la propiedad ya no esté publicada.</p>
        <Link href="/propiedades" className="btn-primary mt-8">Ver propiedades</Link>
      </div>
    </div>
  );
}
