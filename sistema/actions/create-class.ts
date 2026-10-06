import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  createClassSession,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Crear manualmente una fecha de clase que coincida con el horario de la comisión. Normalmente las fechas se generan automáticamente.",
  schema: z.object({
    course: z.string().describe("Id o nombre exacto de la comisión"),
    date: z.string().describe("Fecha de la clase en formato YYYY-MM-DD"),
    topic: z.string().optional().describe("Tema de la clase. Opcional."),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = await resolveCourse(ownerEmail, args.course);
    return createClassSession(ownerEmail, {
      courseId: course.id,
      date: args.date,
      topic: args.topic,
    });
  },
});
