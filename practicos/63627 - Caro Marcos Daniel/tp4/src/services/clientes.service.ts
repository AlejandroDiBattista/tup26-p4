import { db } from "../db/index.js";
import { clientes } from "../db/schema.js";

export class Clientes {
  static listar() {
    return db.select().from(clientes).orderBy(clientes.apellido, clientes.nombre);
  }
}
