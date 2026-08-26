import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  requireUserEmail,
  updateClassSession,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Cambiar el estado de una clase. Permite cancelarla por feriado, asueto, examen, paro u otro motivo, o devolverla a programada.",
  schema: z.object({
    classId: z.string().min(1).describe("Id de la clase"),
    status: z.enum(["programada", "cancelada", "a_confirmar"]).optional(),
    cancellationReason: z
      .enum(["feriado", "asueto", "examen", "paro", "otro"])
      .nullable()
      .optional(),
    cancellationNote: z.string().nullable().optional(),
    topic: z.string().nullable().optional(),
  }),
  run: async (args, ctx) =>
    updateClassSession(requireUserEmail(ctx?.userEmail), args.classId, args),
});
