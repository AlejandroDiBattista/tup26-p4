// Cada archivo de pruebas usa su propia base en memoria, vacía y separada de local.db.
process.env.DATABASE_URL = ":memory:";

const { db } = await import("../src/db/index.js");
const { migrate } = await import("drizzle-orm/libsql/migrator");
await migrate(db, { migrationsFolder: "drizzle" });
