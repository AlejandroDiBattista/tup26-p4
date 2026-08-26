import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  listStudents,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Listar alumnos con legajo, apellido, nombre, teléfono, usuario de GitHub y cantidad de clases presentes. Con `course` devuelve sólo los de esa comisión; sin él, toda la agenda.",
  schema: z.object({
    course: z
      .string()
      .optional()
      .describe("Id o nombre exacto de la comisión. Opcional."),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    if (!args.course) {
      return { students: await listStudents(ownerEmail) };
    }
    const course = await resolveCourse(ownerEmail, args.course);
    return {
      course: { id: course.id, name: course.name },
      students: await listStudents(ownerEmail, course.id),
    };
  },
});
