import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { comprobarTp4 } from "../server/agenda/comprobar-tp4.js";
import { requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Comprobar TP4 de los alumnos filtrados: detecta public/MiniCRM.html y código TypeScript del servidor con contenido en el mismo proyecto dentro de tp4, incluidas subcarpetas. Excluye dependencias, archivos generados, configuraciones, declaraciones y pruebas. Marca presentado si encuentra ambos, o pendiente si faltan. Solo controla presencia: no ejecuta, compila, instala dependencias ni califica funcionamiento. Guarda y verifica estados; los fallos técnicos conservan el estado anterior. Devuelve detalle por legajo.",
  schema: z.object({
    assessmentId: z.string().min(1).describe("Id del trabajo TP4"),
    legajos: z.array(z.string().regex(/^\d+$/)).min(1).max(500)
      .describe("Legajos según los filtros actuales"),
  }),
  run: (args, ctx) => comprobarTp4(requireUserEmail(ctx?.userEmail), args.assessmentId, args.legajos),
});
