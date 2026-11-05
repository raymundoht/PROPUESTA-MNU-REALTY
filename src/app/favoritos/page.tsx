import type { Metadata } from "next";
import { FavoritesList } from "./favorites-list";
import { getAgents, getAllPublicProperties } from "@/lib/repo";

export const metadata: Metadata = { title: "Mis favoritos", robots: { index: false } };

export default async function FavoritesPage() {
  const [properties, agents] = await Promise.all([getAllPublicProperties(), getAgents()]);
  return (
    <div className="container-x py-14">
      <p className="eyebrow">Guardadas</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Mis favoritos</h1>
      <p className="mt-3 text-muted">Se guardan en este navegador.</p>
      <FavoritesList properties={properties} agents={agents} />
    </div>
  );
}
