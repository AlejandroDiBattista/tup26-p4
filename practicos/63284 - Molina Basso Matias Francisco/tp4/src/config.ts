import "dotenv/config";

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
