// Script de inicialización: crea .env si falta y verifica la conexión a la base.
import { copyFileSync, existsSync } from "node:fs";

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("Creado .env a partir de .env.example");
}

const { db, motor } = await import("../config/database.js");
const { sql } = await import("drizzle-orm");

await db.run(sql`select 1`);
console.log(`Conexión OK: ${motor}`);
console.log("Siguiente paso: npm run db:push para crear las tablas del esquema.");
