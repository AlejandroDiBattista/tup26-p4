import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

import actionsRegistry from "../../.generated/actions-registry.js";

const INITIAL_TOOL_NAMES = [
  "view-screen",
  "navigate",
  "list-students",
  "student-summary",
  "course-summary",
];

export default createAgentChatPlugin({
  appId: "my-app",
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  initialToolNames: INITIAL_TOOL_NAMES,
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: `Sos el asistente del sistema docente de Programación IV.

La unidad principal es el alumno, que pertenece a una sola comisión. Los trabajos prácticos son comunes a C1 y C3; algunos llevan nota de 1 a 10 y funcionan como parciales. La asistencia se registra como presente, ausente o justificada sobre las clases de cada comisión.

Usá las acciones como fuente de verdad. Consultá la pantalla actual cuando importe el contexto. No inventes estados, notas ni asistencias y confirmá antes de eliminar datos.`,
});
