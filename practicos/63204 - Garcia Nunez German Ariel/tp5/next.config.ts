// Configuración de Next.js.
import type { NextConfig } from "next";

const configuracion: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@libsql/client", "libsql"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "@libsql/client", "libsql"];
    }
    return config;
  },
};

export default configuracion;
