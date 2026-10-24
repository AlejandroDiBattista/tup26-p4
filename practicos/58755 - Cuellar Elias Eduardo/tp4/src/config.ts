const isProduction = process.env.NODE_ENV === "production";

const DEFAULT_DATABASE_URL = "file:minicrm.db";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;
  if (isProduction) {
    throw new Error("DATABASE_URL es obligatoria en producción (Turso)");
  }
  return DEFAULT_DATABASE_URL;
}

function resolveAuthToken(): string | undefined {
  const token = process.env.DATABASE_AUTH_TOKEN?.trim();
  return token ? token : undefined;
}

export const config = Object.freeze({
  isProduction,
  databaseUrl: resolveDatabaseUrl(),
  authToken: resolveAuthToken(),
});
