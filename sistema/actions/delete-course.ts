import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  deleteCourse,
  requireUserEmail,
  resolveCourse,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Borrar una comisión vacía junto con sus horarios y clases. Si todavía tiene alumnos, primero deben moverse a otra comisión. Es irreversible: confirmar con el docente antes de llamarla.",
  schema: z.object({
    course: z.string().describe("Id o nombre exacto de la comisión"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const course = await resolveCourse(ownerEmail, args.course);
    await deleteCourse(ownerEmail, course.id);
    return { deleted: course.id, name: course.name };
  },
});
