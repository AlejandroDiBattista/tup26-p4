import "dotenv/config";

// Origen externo exacto para TLS en un proxy; no confiamos en X-Forwarded-*.
export const mcpPublicOrigin = process.env.MCP_PUBLIC_ORIGIN || undefined;
if (mcpPublicOrigin) {
  let valid = false;
  try {
    const url = new URL(mcpPublicOrigin);
    valid = ["https:", "http:"].includes(url.protocol) && url.origin === mcpPublicOrigin;
  } catch { /* Rechazar la configuración inválida al iniciar. */ }
  if (!valid) throw new Error("MCP_PUBLIC_ORIGIN debe ser un origen HTTP(S) exacto, sin ruta ni barra final.");
}

const production = process.env.NODE_ENV === "production";
if (
  production &&
  (!process.env.TURSO_DATABASE_URL?.startsWith("libsql://") ||
    !process.env.TURSO_AUTH_TOKEN)
) {
  throw new Error(
    "Producción requiere TURSO_DATABASE_URL (libsql://) y TURSO_AUTH_TOKEN.",
  );
}
export const connection = production
  ? {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    }
  : { url: process.env.DATABASE_URL || "file:local.db" };
