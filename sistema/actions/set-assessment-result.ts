import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  requireUserEmail,
  setAssessmentResult,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Cargar el estado de un alumno en un trabajo y, si corresponde, su nota opcional de 1 a 10.",
  schema: z.object({
    assessmentId: z
      .string()
      .min(1)
      .describe("Id de la evaluación, según list-assessments"),
    legajo: z.string().min(1).describe("Legajo del alumno"),
    status: z
      .enum(["pendiente", "error", "falla", "presentado"])
      .optional()
      .describe(
        "Estado del trabajo: pendiente, error, falla o presentado",
      ),
    submitted: z
      .boolean()
      .optional()
      .describe("Compatibilidad anterior: true equivale a presentado"),
    score: z
      .preprocess(
        (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : v),
        z.number().min(1).max(10).nullable().optional(),
      )
      .describe("Nota opcional de 1 a 10. null borra la nota."),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return setAssessmentResult(ownerEmail, {
      assessmentId: args.assessmentId,
      legajo: args.legajo,
      status: args.status,
      submitted: args.submitted,
      score: args.score,
    });
  },
});
