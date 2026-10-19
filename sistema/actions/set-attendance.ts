import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireUserEmail, setAttendance } from "../server/agenda/store.js";
import { ATTENDANCE_STATUSES } from "../shared/attendance.js";

export default defineAction({
  description:
    "Registrar asistencia como presente, tarde, ausente o justificada. Tarde corresponde a llegar desde 20 minutos después del inicio y cuenta como media asistencia. Acepta varios alumnos de una sola vez.",
  schema: z.object({
    classId: z.string().min(1).describe("Id de la clase, según list-classes"),
    entries: z
      .array(
        z.object({
          legajo: z.string().min(1).describe("Legajo del alumno"),
          status: z
            .enum(ATTENDANCE_STATUSES)
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
