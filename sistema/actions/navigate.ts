/**
 * Navigate the UI to a view.
 *
 * Writes a navigate command to application state which the UI reads and auto-deletes.
 *
 * Usage:
 *   pnpm action navigate --view=chat
 *   pnpm action navigate --path=/some/route
 *
 * Options:
 *   --view   View name to navigate to
 *   --path   URL path to navigate to
 *   --threadId Chat thread ID to open on the chat route
 */

import { defineAction } from "@agent-native/core/action";
import { writeAppState } from "@agent-native/core/application-state";
import { z } from "zod";

export default defineAction({
  description:
    "Navigate the UI to a specific view or path. Writes a navigate command to application state which the UI reads and auto-deletes.",
  schema: z.object({
    view: z
      .string()
      .optional()
      .describe(
        'Vista: "alumnos", "alumno", "asistencia", "trabajos", "cursos" o "chat".',
      ),
    path: z.string().optional().describe("URL path to navigate to"),
    threadId: z.string().optional().describe("Chat thread ID to open"),
    courseId: z
      .string()
      .optional()
      .describe('Con view="cursos": abrir esta comisión.'),
    legajo: z
      .string()
      .optional()
      .describe('With view="alumno": open this student\'s sheet'),
    assessmentId: z
      .string()
      .optional()
      .describe('Con view="trabajos": seleccionar este trabajo.'),
    classId: z
      .string()
      .optional()
      .describe('Con view="asistencia": seleccionar esta clase.'),
  }),
  http: false,
  run: async (args) => {
    if (!args.view && !args.path) {
      throw new Error("At least --view or --path is required.");
    }
    const nav: Record<string, string> = {};
    if (args.view) nav.view = args.view;
    if (args.path) nav.path = args.path;
    if (args.threadId) nav.threadId = args.threadId;
    if (args.courseId) nav.courseId = args.courseId;
    if (args.legajo) nav.legajo = args.legajo;
    if (args.assessmentId) nav.assessmentId = args.assessmentId;
    if (args.classId) nav.classId = args.classId;
    nav._writeId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await writeAppState("navigate", nav);
    return `Navigating to ${args.view || args.path}`;
  },
});
