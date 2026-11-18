import type { NextConfig } from "next";

/**
 * Versión estática para GitHub Pages (la genera .github/workflows/pages.yml):
 * sin servidor, sin optimización de imágenes y servida bajo /PROPUESTA-MNU-REALTY.
 */
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? (process.env.PAGES_BASE_PATH ?? "/PROPUESTA-MNU-REALTY") : undefined;

const nextConfig: NextConfig = {
  // El prerender parcial (PPR) no existe en un sitio estático: en Pages se apaga.
  cacheComponents: !pages,
  partialPrefetching: !pages,
  // Sin cacheComponents, "use cache" necesita este flag (solo en la versión estática).
  experimental: pages ? { useCache: true } : undefined,
  // Hostinger (Node.js Web App) ejecuta `npm run build` + `npm start`.
  // `standalone` reduce el paquete si en el futuro se despliega en VPS/contenedor.
  output: pages ? "export" : process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  basePath,
  trailingSlash: pages,
  env: { NEXT_PUBLIC_STATIC_EXPORT: pages ? "true" : "false" },
  images: {
    unoptimized: pages,
    // 90 solo para las fotos a pantalla completa del hero.
    qualities: [75, 90],
    remotePatterns: [
      // Fotos de ejemplo (solo modo demo). Las reales vendrán de S3/CloudFront.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Fotos del inventario real de MNU Realty (CDN de EasyBroker).
      { protocol: "https", hostname: "assets.easybroker.com" },
      // { protocol: "https", hostname: "<bucket>.s3.<region>.amazonaws.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
