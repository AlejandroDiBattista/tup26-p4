import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireUserEmail, updateAssessment } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Editar el título, la fecha de solicitud o si un trabajo práctico lleva nota.",
  schema: z.object({
    assessmentId: z.string().min(1).describe("Id del trabajo práctico"),
    title: z.string().optional().describe("Nuevo título"),
    date: z
      .string()
      .nullable()
      .optional()
      .describe("Fecha de solicitud YYYY-MM-DD; null la borra"),
    graded: z.boolean().optional().describe("Si permite nota de 1 a 10"),
  }),
  run: async (args, ctx) =>
    updateAssessment(requireUserEmail(ctx?.userEmail), args.assessmentId, args),
});
