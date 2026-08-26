import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import {
  courseSummary,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Resumen de la comisión: estados de trabajos compartidos, notas opcionales y asistencia de cada alumno.",
  schema: z.object({
    course: z.string().describe("Id o nombre exacto de la comisión"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = await resolveCourse(ownerEmail, args.course);
    return courseSummary(ownerEmail, course.id);
  },
  link: ({ result }) => {
    const course = (result as { course?: { id: string; name: string } })
      ?.course;
    if (!course?.id) return null;
    return {
      url: buildDeepLink({ view: "cursos", params: { courseId: course.id } }),
      label: course.name,
    };
  },
});
