import { createDb, runMigrations } from "./client.js";

const db = createDb();
runMigrations(db);

console.log("Migraciones aplicadas.");
