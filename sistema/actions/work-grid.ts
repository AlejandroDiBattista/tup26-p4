import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import {
  assessmentGrid,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Devolver la grilla de trabajos comunes con todos los alumnos o filtrada por una comisión.",
  schema: z.object({
    course: z
      .string()
      .optional()
      .describe("Id, nombre o código C1/C3. Opcional."),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = args.course
      ? await resolveCourse(ownerEmail, args.course)
      : undefined;
    return {
      ...(course ? { course } : {}),
      ...(await assessmentGrid(ownerEmail, course?.id)),
    };
  },
  link: () => ({
    url: buildDeepLink({ view: "trabajos" }),
    label: "Trabajos prácticos",
  }),
});
