import { eq, like, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { actividades, clientes } from "../db/schema.js";

export class Clientes {
    static listar() {
    return db.select().from(clientes);
  }
}