import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  requireUserEmail,
  resolveCourse,
  updateCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Editar nombre, código, aula, período u horarios de una comisión. Los campos omitidos no se tocan.",
  schema: z.object({
    course: z.string().describe("Id o nombre exacto de la comisión"),
    name: z.string().optional().describe("Nuevo nombre"),
    term: z.string().optional().describe("Nuevo período"),
    commission: z
      .string()
      .optional()
      .describe("Código de comisión, por ejemplo C1"),
    classroom: z.string().optional().describe("Aula"),
    schedule: z
      .array(
        z.object({
          weekday: z.number().int().min(1).max(7),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
        }),
      )
      .optional(),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = await resolveCourse(ownerEmail, args.course);
    return updateCourse(ownerEmail, course.id, args);
  },
});
