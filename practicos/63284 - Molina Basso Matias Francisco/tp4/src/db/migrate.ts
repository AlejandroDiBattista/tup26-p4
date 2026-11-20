import { migrate } from "drizzle-orm/libsql/migrator";
import { client, db } from "./index.js";

try {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migraciones aplicadas.");
} finally {
  client.close();
}
