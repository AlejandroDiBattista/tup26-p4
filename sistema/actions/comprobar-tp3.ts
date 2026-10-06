import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { comprobarTp3 } from "../server/agenda/comprobar-tp3.js";
import { requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Comprobar TP3 de los alumnos filtrados: tp3/agenda.html debe tener al menos 100 líneas agregadas respecto de enunciados/tp3/agenda.html, contadas por diff. También detecta una entrega subida dentro de tp3/tp3/agenda.html y detalla la ruta usada. Falta de archivo o menos de 100 agregadas: pendiente; al menos 100: presentado. Lee los archivos directamente, guarda y verifica los estados y devuelve el detalle por alumno. No ejecuta la entrega.",
  schema: z.object({
    assessmentId: z.string().min(1).describe("Id del trabajo TP3"),
    legajos: z
      .array(z.string().regex(/^\d+$/))
      .min(1)
      .max(500)
      .describe("Legajos según los filtros actuales"),
  }),
  run: (args, ctx) =>
    comprobarTp3(requireUserEmail(ctx?.userEmail), args.assessmentId, args.legajos),
});
