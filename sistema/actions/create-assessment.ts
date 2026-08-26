import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  createAssessment,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Crear un trabajo práctico común a todas las comisiones. Puede llevar nota opcional entre 1 y 10.",
  schema: z.object({
    course: z
      .string()
      .optional()
      .describe("Comisión de referencia. Opcional porque el trabajo es común."),
    kind: z
      .enum(["practico", "parcial"])
      .optional()
      .describe("Compatibilidad: parcial equivale a graded=true"),
    title: z
      .string()
      .min(1)
      .describe('Título, por ejemplo "TP 3" o "1er Parcial"'),
    date: z
      .string()
      .optional()
      .describe("Fecha de solicitud en formato YYYY-MM-DD. Opcional."),
    graded: z
      .boolean()
      .optional()
      .describe("true cuando el trabajo permite cargar nota de 1 a 10"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = args.course
      ? await resolveCourse(ownerEmail, args.course)
      : undefined;
    return createAssessment(ownerEmail, {
      courseId: course?.id,
      kind: args.kind,
      title: args.title,
      date: args.date,
      graded: args.graded,
    });
  },
});
