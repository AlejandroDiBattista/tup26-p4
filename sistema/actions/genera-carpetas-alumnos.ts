import path from "node:path";

import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { genera_carpetas_alumnos } from "../server/agenda/genera-carpetas-alumnos.js";
import { listStudents, requireUserEmail } from "../server/agenda/store.js";

function directorioPracticos(): string {
  return path.resolve(process.cwd(), "..", "practicos");
}

export default defineAction({
  description:
    "Crear dentro de practicos una carpeta por alumno con el formato `<legajo> - <apellido> <nombre>`, conservando mayúsculas y minúsculas pero sin acentos. Si el legajo ya tiene una carpeta con otro nombre, la renombra y conserva su contenido.",
  schema: z.object({}),
  run: async (_args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const students = await listStudents(ownerEmail);
    return genera_carpetas_alumnos(students, directorioPracticos());
  },
});
