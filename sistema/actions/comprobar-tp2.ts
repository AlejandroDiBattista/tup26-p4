import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { comprobarTp2 } from "../server/agenda/comprobar-tp2.js";
import { requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description: "Comprobar TP2 de los alumnos seleccionados: edit.jsx debe tener al menos 100 líneas y compilar JSX sin errores. No ejecuta código del alumno ni verifica su funcionamiento. Guarda y verifica los estados y devuelve el detalle por alumno.",
  schema: z.object({
    assessmentId: z.string().min(1).describe("Id del trabajo TP2"),
    legajos: z.array(z.string().regex(/^\d+$/)).min(1).max(500).describe("Legajos según los filtros actuales"),
  }),
  run: (args, ctx) => comprobarTp2(requireUserEmail(ctx?.userEmail), args.assessmentId, args.legajos),
});
