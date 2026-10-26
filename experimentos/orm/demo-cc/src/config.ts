const isProd = process.env.NODE_ENV === "production";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  if (isProd) throw new Error("DATABASE_URL es obligatorio en producción (Turso)");
  return "file:local.db";
}

export const config = {
  databaseUrl: resolveDatabaseUrl(),
  authToken: process.env.DATABASE_AUTH_TOKEN,
};
