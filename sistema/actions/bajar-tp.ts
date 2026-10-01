import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { conectarGitHubPr } from "../server/agenda/github-pr.js";
import { bajarTp } from "../server/agenda/bajar-tp.js";
import { listStudents, requireUserEmail } from "../server/agenda/store.js";

export default defineAction({
  timeoutMs: 600_000,
  description:
    "Bajar TP: revisa los PR abiertos, normaliza el título como TP 01 - Legajo - Apellido Nombre y hace merge automático únicamente si todos los archivos y rutas anteriores pertenecen a una única carpeta de alumno y TP, y el autor coincide con su GitHub en el padrón. Verifica título y merge. Luego descarga la rama por defecto al checkout local mediante fast-forward, conservando los cambios locales, incluso si no quedan PR abiertos. Devuelve incorporaciones, omisiones, errores por PR y resultado de sincronización; un conflicto local se informa sin descartar cambios.",
  schema: z.object({
    dryRun: z
      .boolean()
      .default(false)
      .describe("Revisar y mostrar los títulos propuestos sin modificar GitHub"),
  }),
  run: async (args, ctx) => {
    const userEmail = requireUserEmail(ctx?.userEmail);
    const students = await listStudents(userEmail);
    const { repository, github, synchronize } = await conectarGitHubPr({ userEmail, orgId: ctx?.orgId });
    const result = await bajarTp(students, github, args.dryRun);
    // También descarga cuando no quedan PR abiertos: pueden haberse fusionado
    // desde GitHub o en una ejecución anterior sin actualizar esta copia.
    return { repository, ...result, ...(!args.dryRun ? { sync: await synchronize() } : {}) };
  },
});
