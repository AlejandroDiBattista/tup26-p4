import path from "node:path";

import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { publicar_enunciado_trabajo } from "../server/agenda/publicar-enunciado-trabajo.js";
import {
  getAssessment,
  listStudents,
  requireUserEmail,
} from "../server/agenda/store.js";

function directoriosPublicacion(): {
  enunciados: string;
  practicos: string;
} {
  const repository = path.resolve(process.cwd(), "..");
  return {
    enunciados: path.join(repository, "enunciados"),
    practicos: path.join(repository, "practicos"),
  };
}

export default defineAction({
  description:
    "Publicar el enunciado del trabajo práctico seleccionado en la carpeta de cada alumno. Genera primero las carpetas del padrón y nunca sobrescribe una publicación existente.",
  schema: z.object({
    assessmentId: z
      .string()
      .min(1)
      .describe("Id del trabajo práctico seleccionado"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const [assessment, students] = await Promise.all([
      getAssessment(ownerEmail, args.assessmentId),
      listStudents(ownerEmail),
    ]);
    const directories = directoriosPublicacion();
    return publicar_enunciado_trabajo(
      students,
      assessment.title,
      directories.enunciados,
      directories.practicos,
    );
  },
});
