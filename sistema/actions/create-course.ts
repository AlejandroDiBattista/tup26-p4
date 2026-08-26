import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import { createCourse, requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description: "Crear una comisión nueva dentro de Programación IV.",
  schema: z.object({
    name: z
      .string()
      .min(1)
      .describe('Nombre, por ejemplo "Programación 4 - C2"'),
    commission: z
      .string()
      .min(1)
      .describe('Código de comisión, por ejemplo "C2"'),
    classroom: z.string().optional().describe("Aula de cursado"),
    term: z
      .string()
      .optional()
      .describe('Período, por ejemplo "2026 - 1er cuatrimestre"'),
    schedule: z
      .array(
        z.object({
          weekday: z
            .number()
            .int()
            .min(1)
            .max(7)
            .describe("1=lunes, 7=domingo"),
          startTime: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .describe("Hora HH:MM"),
          endTime: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .describe("Hora HH:MM"),
        }),
      )
      .optional()
      .describe("Horarios semanales"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return createCourse(ownerEmail, args);
  },
  link: ({ result }) => {
    const course = result as { id?: string; name?: string };
    if (!course?.id) return null;
    return {
      url: buildDeepLink({ view: "cursos", params: { courseId: course.id } }),
      label: course.name ?? "Comisión",
    };
  },
});
