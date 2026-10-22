import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { connection } from "../config.js";
import * as schema from "./schema.js";

export const client = createClient(connection);
export const db = drizzle(client, { schema });
