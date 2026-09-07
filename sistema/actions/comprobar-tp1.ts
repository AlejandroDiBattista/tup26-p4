import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { comprobarTp1 } from "../server/agenda/comprobar-tp1.js";
import { requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description: "Ejecutar tools/probar-tp1.js para los alumnos seleccionados y guardar los estados de TP1. Devuelve los resultados guardados y los errores de comprobación.",
  schema: z.object({
    assessmentId: z.string().min(1).describe("Id del trabajo TP1"),
    legajos: z.array(z.string().regex(/^\d+$/)).min(1).max(500)
      .describe("Legajos de los alumnos a comprobar, según los filtros de la pantalla"),
  }),
  run: async (args, ctx) => comprobarTp1(requireUserEmail(ctx?.userEmail), args.assessmentId, args.legajos),
});
