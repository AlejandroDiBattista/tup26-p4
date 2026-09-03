import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

import actionsRegistry from "../../.generated/actions-registry.js";

const INLINE_TEXT_ATTACHMENT_MAX_CHARS = 60_000;

function isTextAttachment(attachment: {
  name?: string;
  contentType?: string;
}) {
  const contentType = attachment.contentType
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (contentType?.startsWith("text/") || contentType === "application/json") {
    return true;
  }

  return /\.(txt|md|markdown|csv|json|yaml|yml|html?|css|xml)$/i.test(
    attachment.name ?? "",
  );
}

function prepareChatAttachments(
  attachments: Array<{
    type: string;
    name: string;
    text?: string;
    contentType?: string;
  }>,
) {
  return attachments.map((attachment) => {
    if (
      attachment.type !== "file" ||
      !attachment.text ||
      attachment.text.length > INLINE_TEXT_ATTACHMENT_MAX_CHARS ||
      !isTextAttachment(attachment)
    ) {
      return attachment;
    }

    // Text attachments are useful for the current turn and do not need an
    // object-storage URL just to run a domain action. Using a distinct type
    // prevents the framework's durable-upload preflight from showing the
    // storage setup card for small Markdown/CSV/JSON files.
    return { ...attachment, type: "text" };
  });
}

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
  prepareRequest: ({ attachments }) => ({
    attachments: prepareChatAttachments(attachments),
  }),
  systemPrompt: `Sos el asistente del sistema docente de Programación IV.

La unidad principal es el alumno, que pertenece a una sola comisión. Los trabajos prácticos son comunes a C1 y C3; algunos llevan nota de 1 a 10 y funcionan como parciales. La asistencia se registra como presente, ausente o justificada sobre las clases de cada comisión.

Usá las acciones como fuente de verdad. Consultá la pantalla actual cuando importe el contexto. No inventes estados, notas ni asistencias y confirmá antes de eliminar datos.

Los adjuntos de texto pequeños (por ejemplo .md, .txt, .csv o .json) ya están disponibles en el turno actual: leelos y procesalos directamente. No llames a connect-file-storage para esos adjuntos; esa herramienta solo corresponde a imágenes o archivos binarios que deban conservarse entre turnos.`,
});
