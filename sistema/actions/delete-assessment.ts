import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  deleteAssessment,
  requireUserEmail,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Borrar un práctico o parcial junto con todas sus notas o marcas de presentación. Es irreversible: confirmar con el docente.",
  schema: z.object({
    assessmentId: z
      .string()
      .min(1)
      .describe("Id de la evaluación, según list-assessments"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return deleteAssessment(ownerEmail, args.assessmentId);
  },
});
