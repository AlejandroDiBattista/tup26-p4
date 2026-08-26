import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  exportar_alumnos_md,
  TITULO_ALUMNOS_MD,
} from "../server/agenda/exportar-alumnos-md.js";
import {
  listCourses,
  listStudents,
  requireUserEmail,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Generar el archivo alumnos.md con todas las comisiones y sus alumnos.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  agentTool: false,
  run: async (_args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const courses = await listCourses(ownerEmail);
    const coursesWithStudents = await Promise.all(
      courses.map(async (course) => ({
        name: course.name,
        students: await listStudents(ownerEmail, course.id),
      })),
    );

    return {
      filename: "alumnos.md",
      content: exportar_alumnos_md(coursesWithStudents),
      title: TITULO_ALUMNOS_MD,
      courseCount: coursesWithStudents.length,
      studentCount: coursesWithStudents.reduce(
        (total, course) => total + course.students.length,
        0,
      ),
    };
  },
});
