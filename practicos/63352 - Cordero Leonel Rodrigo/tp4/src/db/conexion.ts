import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./esquema.js";

const url = process.env.DATABASE_URL ?? "file:local.db";

export const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

await client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle(client, { schema });
export type Db = typeof db;
