import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  requireUserEmail,
  resolveCourse,
  upsertStudent,
} from "../server/agenda/store.js";

export default defineAction({
  description:
    "Dar de alta o editar un alumno por su legajo, y opcionalmente inscribirlo en una comisión. Si el legajo ya existe actualiza sólo los campos enviados. Para un alta nueva hacen falta apellido y nombre.",
  schema: z.object({
    legajo: z.string().min(1).describe("Legajo del alumno: es su identificador"),
    apellido: z.string().optional().describe("Apellido"),
    nombre: z.string().optional().describe("Nombre"),
    telefono: z.string().optional().describe("Teléfono de contacto"),
    github: z
      .string()
      .optional()
      .describe("Usuario de GitHub. Acepta '@juan' o la URL del perfil."),
    course: z
      .string()
      .optional()
      .describe("Id o nombre de la comisión en la que inscribirlo"),
  }),
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    const courseId = args.course
      ? (await resolveCourse(ownerEmail, args.course)).id
      : undefined;
    return upsertStudent(ownerEmail, {
      legajo: args.legajo,
      apellido: args.apellido,
      nombre: args.nombre,
      telefono: args.telefono,
      github: args.github,
      courseId,
    });
  },
});
