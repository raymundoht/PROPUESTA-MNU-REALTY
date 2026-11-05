export function DetailSkeleton() {
  return (
    <div className="container-x animate-pulse py-8" aria-busy aria-label="Cargando">
      <div className="h-4 w-48 rounded bg-sand" />
      <div className="mt-6 h-10 w-2/3 rounded bg-sand" />
      <div className="mt-6 h-[300px] rounded-card bg-sand sm:h-[420px] lg:h-[520px]" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <div className="h-5 w-40 rounded bg-sand" />
          <div className="h-24 rounded-card bg-sand" />
        </div>
        <div className="h-72 rounded-card bg-sand" />
      </div>
    </div>
  );
}
