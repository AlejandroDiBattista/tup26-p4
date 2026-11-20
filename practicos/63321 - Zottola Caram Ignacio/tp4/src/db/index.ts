import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.ts";

const sqlite = createClient({ url: "file:minicrm.sqlite" });
await sqlite.execute("PRAGMA foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
