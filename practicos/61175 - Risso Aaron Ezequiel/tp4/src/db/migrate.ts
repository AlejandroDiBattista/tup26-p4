import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index.js";

migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migraciones aplicadas.");
