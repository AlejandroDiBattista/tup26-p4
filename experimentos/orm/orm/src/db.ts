import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { obtenerTokenBase, obtenerUrlBase } from "../database-config.js";

const cliente = createClient({
  url: obtenerUrlBase(),
  authToken: obtenerTokenBase()
});

export const db = drizzle(cliente);
