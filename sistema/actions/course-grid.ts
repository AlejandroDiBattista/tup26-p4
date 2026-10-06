import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import {
  assessmentGrid,
  attendanceGrid,
  listCourses,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Devolver una grilla de comisión. Para asistencia incluye clases y estados presente/ausente/justificada; para prácticos devuelve los trabajos compartidos con estado y nota opcional.",
  schema: z.object({
    course: z
      .string()
      .optional()
      .describe("Id o nombre exacto de la comisión; omitir para todas en asistencia"),
    kind: z.enum(["practico", "parcial", "asistencia"]).describe("Qué grilla devolver"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = args.course ? await resolveCourse(ownerEmail, args.course) : null;
    if (!course && args.kind !== "asistencia") {
      throw new Error("La grilla de prácticos necesita una comisión.");
    }
    const grid =
      args.kind === "asistencia"
        ? await attendanceGrid(ownerEmail, course?.id)
        : await assessmentGrid(ownerEmail, course!.id, args.kind);
    const courses =
      args.kind === "asistencia"
        ? (await listCourses(ownerEmail)).map(({ id, name, commission, classroom }) => ({
            id,
            name,
            commission,
            classroom,
          }))
        : undefined;
    return {
      course: course
        ? {
            id: course.id,
            name: course.name,
            commission: course.commission,
            classroom: course.classroom,
          }
        : null,
      ...(courses ? { courses } : {}),
      kind: args.kind,
      ...grid,
    };
  },
  link: ({ result }) => {
    const course = (result as { course?: { id: string; name: string } })?.course;
    if (!course?.id) return null;
    const kind = (result as { kind?: string })?.kind;
    return {
      url: buildDeepLink({
        view: kind === "asistencia" ? "asistencia" : "trabajos",
        params: { courseId: course.id },
      }),
      label: course.name,
    };
  },
});
