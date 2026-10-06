import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireUserEmail, setAttendance } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Registrar asistencia como presente, ausente o justificada. Acepta varios alumnos de una sola vez.",
  schema: z.object({
    classId: z.string().min(1).describe("Id de la clase, según list-classes"),
    entries: z
      .array(
        z.object({
          legajo: z.string().min(1).describe("Legajo del alumno"),
          status: z
            .enum(["presente", "ausente", "justificada"])
            .nullable()
            .optional()
            .describe("null deja la asistencia sin registrar"),
          present: z
            .boolean()
            .optional()
            .describe("Compatibilidad anterior: true=presente, false=ausente"),
        }),
      )
      .min(1)
      .describe("Alumnos a marcar en esta clase"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return setAttendance(ownerEmail, {
      sessionId: args.classId,
      entries: args.entries,
    });
  },
});
