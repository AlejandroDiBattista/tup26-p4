import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { deleteStudent, requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Borrar un alumno junto con su inscripción, resultados y asistencias. Confirmar con el docente antes de ejecutar.",
  schema: z.object({
    legajo: z.string().min(1).describe("Legajo del alumno"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return deleteStudent(ownerEmail, args.legajo);
  },
});
