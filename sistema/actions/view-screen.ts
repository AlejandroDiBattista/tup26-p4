/**
 * See what the user is currently looking at on screen.
 *
 * Reads the current navigation state from application state and, when the user
 * is inside a course, resolves that course so the agent can act on it without
 * asking "which one?".
 *
 * Usage:
 *   pnpm action view-screen
 */

import { defineAction } from "@agent-native/core/action";
import { readAppState } from "@agent-native/core/application-state";
import { z } from "zod";

import {
  findStudentByLegajo,
  getAssessment,
  getClassSession,
  getCourse,
  requireUserEmail,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Ver la pantalla actual. Devuelve la vista abierta y, cuando corresponde, la comisión o el alumno visible. Llamar antes de actuar sobre el contexto actual.",
  schema: z.object({}),
  http: false,
  readOnly: true,
  run: async (_args, ctx) => {
    const navigation = (await readAppState("navigation")) as {
      view?: string;
      courseId?: string;
      legajo?: string;
      assessmentId?: string;
      classId?: string;
    } | null;

    const screen: Record<string, unknown> = {};
    if (navigation) screen.navigation = navigation;

    // El curso abierto es lo que el docente tiene delante: resolverlo acá
    // evita que el agente vuelva a preguntar de qué comisión se trata.
    if (navigation?.courseId && ctx?.userEmail) {
      try {
        const course = await getCourse(
          requireUserEmail(ctx.userEmail),
          navigation.courseId,
        );
        screen.course = {
          id: course.id,
          name: course.name,
          term: course.term,
        };
      } catch {
        // El curso pudo borrarse con la pantalla abierta: no es un error de esta lectura.
      }
    }

    if (navigation?.legajo && ctx?.userEmail) {
      const student = await findStudentByLegajo(
        requireUserEmail(ctx.userEmail),
        navigation.legajo,
      );
      if (student) {
        screen.student = {
          legajo: student.legajo,
          apellido: student.apellido,
          nombre: student.nombre,
        };
      }
    }

    if (navigation?.assessmentId && ctx?.userEmail) {
      try {
        const work = await getAssessment(
          requireUserEmail(ctx.userEmail),
          navigation.assessmentId,
        );
        screen.work = {
          id: work.id,
          title: work.title,
          date: work.date,
          graded: work.graded,
        };
      } catch {}
    }

    if (navigation?.classId && ctx?.userEmail) {
      try {
        const classSession = await getClassSession(
          requireUserEmail(ctx.userEmail),
          navigation.classId,
        );
        screen.classSession = {
          id: classSession.id,
          date: classSession.date,
          status: classSession.status,
        };
      } catch {}
    }

    if (Object.keys(screen).length === 0) {
      return "No application state found. Is the app running?";
    }
    return screen;
  },
});
