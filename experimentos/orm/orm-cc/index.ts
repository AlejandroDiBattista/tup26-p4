import { db } from "./db";
import { alumnos } from "./schema";

await db.insert(alumnos).values({ nombre: "Ana", email: "ana@mail.com" });

const lista = await db.select().from(alumnos);
console.table(lista);
