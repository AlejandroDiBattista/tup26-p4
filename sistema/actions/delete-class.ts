import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  deleteClassSession,
  requireUserEmail,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Borrar una clase y su asistencia tomada. Es irreversible: confirmar con el docente.",
  schema: z.object({
    classId: z.string().min(1).describe("Id de la clase, según list-classes"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return deleteClassSession(ownerEmail, args.classId);
  },
});
