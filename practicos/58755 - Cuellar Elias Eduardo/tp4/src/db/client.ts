import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config.js";
import * as schema from "./schema.js";

export function createDb(url: string = config.databaseUrl, authToken: string | undefined = config.authToken) {
  const client = createClient(authToken ? { url, authToken } : { url });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;

// Instancia compartida para la aplicación.
export const db = createDb();
