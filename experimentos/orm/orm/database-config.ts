import "dotenv/config";

export function obtenerUrlBase(): string {
  if (process.env.NODE_ENV !== "production") {
    return process.env.DATABASE_URL ?? "file:./local.db";
  }

  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url?.startsWith("libsql://") || !token) {
    throw new Error(
      "En producción se requieren TURSO_DATABASE_URL (libsql://) y TURSO_AUTH_TOKEN."
    );
  }

  return url;
}

export function obtenerTokenBase(): string | undefined {
  return process.env.NODE_ENV === "production"
    ? process.env.TURSO_AUTH_TOKEN
    : undefined;
}
