import { migrate } from "drizzle-orm/libsql/migrator";
import { config } from "../config.js";
import { db } from "./client.js";

await migrate(db, { migrationsFolder: "drizzle" });
console.log(`Migraciones aplicadas en ${config.databaseUrl}`);
