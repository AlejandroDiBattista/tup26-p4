import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  listClassSessions,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Listar el calendario de una comisión, incluyendo horario, aula y cancelaciones.",
  schema: z.object({
    course: z.string().describe("Id o nombre exacto de la comisión"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = await resolveCourse(ownerEmail, args.course);
    return {
      course: {
        id: course.id,
        name: course.name,
        commission: course.commission,
        classroom: course.classroom,
      },
      classes: await listClassSessions(ownerEmail, course.id),
    };
  },
});
