import { migrate } from "drizzle-orm/libsql/migrator";

import { client, db } from "./conexion.js";

export async function migrar() {
  await migrate(db, { migrationsFolder: "drizzle" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await migrar();
  console.log("Migraciones aplicadas");
  await client.close();
}
