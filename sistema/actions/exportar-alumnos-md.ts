import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  exportar_alumnos_md,
  TITULO_ALUMNOS_MD,
} from "../server/agenda/exportar-alumnos-md.js";
import {
  assessmentGrid,
  attendanceGrid,
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
      courses.map(async (course) => {
        const [students, works, attendance] = await Promise.all([
          listStudents(ownerEmail, course.id),
          assessmentGrid(ownerEmail, course.id),
          attendanceGrid(ownerEmail, course.id),
        ]);
        const attendanceByLegajo = new Map(
          attendance.rows.map((row) => [row.legajo, row.presentes]),
        );
        const workByLegajo = new Map(
          works.rows.map((row) => [row.legajo, row]),
        );

        return {
          name: course.name,
          assessments: works.assessments.map(({ id, title }) => ({
            id,
            title,
          })),
          students: students.map((student) => ({
            legajo: student.legajo,
            apellido: student.apellido,
            nombre: student.nombre,
            telefono: student.telefono,
            github: student.github,
            asistencia: String(
              attendanceByLegajo.get(student.legajo) ??
                student.clasesPresentes,
            ),
            assessmentStatuses: Object.fromEntries(
              workByLegajo
                .get(student.legajo)
                ?.cells.map((cell) => [cell.assessmentId, cell.status]) ??
                [],
            ),
          })),
        };
      }),
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
