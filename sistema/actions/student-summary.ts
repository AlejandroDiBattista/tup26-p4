import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import { requireUserEmail, studentSummary } from "../server/agenda/store.js";

export default defineAction({
  description:
    "Ficha completa de un alumno: datos, su única comisión, trabajos con estado y nota opcional, y asistencia clase por clase.",
  schema: z.object({
    legajo: z.string().min(1).describe("Legajo del alumno"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) => {
    const ownerEmail = requireUserEmail(ctx?.userEmail);
    return studentSummary(ownerEmail, args.legajo);
  },
  link: ({ result }) => {
    const data = result as {
      student?: { legajo: string; apellido: string; nombre: string };
      course?: { id: string } | null;
    };
    if (!data?.student?.legajo) return null;
    return {
      url: buildDeepLink({
        view: "alumno",
        params: {
          legajo: data.student.legajo,
          ...(data.course?.id ? { curso: data.course.id } : {}),
        },
      }),
      label: `${data.student.apellido}, ${data.student.nombre}`,
    };
  },
});
