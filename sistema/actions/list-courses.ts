import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { listCourses, requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Listar las comisiones o materias del docente, con su id, nombre y período.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async (_args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return { courses: await listCourses(ownerEmail) };
  },
});
