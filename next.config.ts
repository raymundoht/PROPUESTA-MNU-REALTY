import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hostinger (Node.js Web App) ejecuta `npm run build` + `npm start`.
  // `standalone` reduce el paquete si en el futuro se despliega en VPS/contenedor.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  images: {
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
