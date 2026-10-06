import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { exportar_alumnos_vcard } from "../server/agenda/exportar-alumnos-vcard.js";
import {
  listCourses,
  listStudents,
  requireUserEmail,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Generar el archivo alumnos.vcf con una tarjeta vCard por cada alumno.",
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
      filename: "alumnos.vcf",
      content: exportar_alumnos_vcard(coursesWithStudents),
      courseCount: coursesWithStudents.length,
      studentCount: coursesWithStudents.reduce(
        (total, course) => total + course.students.length,
        0,
      ),
    };
  },
});
