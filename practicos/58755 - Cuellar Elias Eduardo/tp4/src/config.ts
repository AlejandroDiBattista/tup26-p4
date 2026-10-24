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

const DEFAULT_PORT = 3000;

function resolvePort(): number {
  const raw = process.env.PORT?.trim();
  if (!raw) return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT inválido: "${raw}"`);
  }
  return port;
}

export const config = Object.freeze({
  isProduction,
  port: resolvePort(),
  databaseUrl: resolveDatabaseUrl(),
  authToken: resolveAuthToken(),
});
