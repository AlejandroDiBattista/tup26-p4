try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan los valores por defecto
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  dbFile: process.env.DB_FILE ?? "./data/minicrm.db",
  tursoUrl: process.env.TURSO_DATABASE_URL || undefined,
  tursoToken: process.env.TURSO_AUTH_TOKEN || undefined,
};
