import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  generateClassSessions,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Generar automáticamente las fechas de clase de una comisión a partir de sus horarios semanales. No duplica fechas existentes.",
  schema: z.object({
    course: z.string().describe("Id, nombre o código C1/C3"),
    startDate: z.string().describe("Inicio YYYY-MM-DD"),
    endDate: z.string().describe("Fin YYYY-MM-DD"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = await resolveCourse(ownerEmail, args.course);
    return generateClassSessions(ownerEmail, {
      courseId: course.id,
      startDate: args.startDate,
      endDate: args.endDate,
    });
  },
});
