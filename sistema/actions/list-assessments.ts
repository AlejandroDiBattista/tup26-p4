import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  listAssessments,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Listar los trabajos prácticos comunes a todas las comisiones, indicando cuáles llevan nota.",
  schema: z.object({
    course: z.string().optional().describe("Comisión de referencia. Opcional."),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = args.course
      ? await resolveCourse(ownerEmail, args.course)
      : undefined;
    return {
      ...(course ? { course: { id: course.id, name: course.name } } : {}),
      assessments: await listAssessments(ownerEmail, course?.id),
    };
  },
});
