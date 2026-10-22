import { migrate } from "drizzle-orm/libsql/migrator";

import { client, db } from "./index.js";

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.info("Migraciones aplicadas correctamente.");
} catch (error) {
  console.error("No se pudieron aplicar las migraciones:", error);
  process.exitCode = 1;
} finally {
  await client.close();
}
