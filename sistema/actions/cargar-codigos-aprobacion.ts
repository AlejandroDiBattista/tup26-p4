import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { cargarCodigosAprobacion } from "../server/agenda/cargar-codigos-aprobacion.js";
import { requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Cargar códigos de aprobación con cuatro partes: legajo (5 dígitos).nota (2 dígitos).respuestas (base 32, 0–9 y a–v).verificación (2 dígitos). Extrae el legajo de la primera parte y la nota de la segunda: (XX módulo 20) / 2; si da 0, vale 10. Solo aumenta notas, conserva iguales o superiores, deduplica por la mayor nota y verifica cada escritura. No recalcula el código de verificación. dryRun permite previsualizar sin guardar.",
  schema: z.object({
    assessmentId: z.string().min(1).describe("Id del práctico o parcial que lleva nota"),
    text: z
      .string()
      .trim()
      .min(1)
      .max(100_000)
      .describe(
        "Texto pegado con códigos legajo.XX.respuestas.VV (5 dígitos, 2 dígitos, base 32, 2 dígitos)",
      ),
    dryRun: z.boolean().default(false).describe("Previsualizar sin modificar notas"),
  }),
  run: (args, ctx) =>
    cargarCodigosAprobacion(
      requireUserEmail(ctx?.userEmail),
      args.assessmentId,
      args.text,
      args.dryRun,
    ),
});
