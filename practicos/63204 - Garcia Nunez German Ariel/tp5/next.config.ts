// Configuración de Next.js.
import type { NextConfig } from "next";

const configuracion: NextConfig = {
  // @libsql/client usa módulos nativos: se deja fuera del empaquetado del servidor.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default configuracion;
