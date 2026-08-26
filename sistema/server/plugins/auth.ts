import { createAuthPlugin } from "@agent-native/core/server";

const rawAppTitle = "Programación IV";
const appTitle = rawAppTitle === "{" + "{APP_TITLE}}" ? "Chat" : rawAppTitle;

export default createAuthPlugin({
  marketing: {
    appName: appTitle,
    tagline:
      "Gestión de alumnos, trabajos prácticos y asistencia.",
    features: [
      "Padrón único de alumnos por comisión",
      "Trabajos compartidos y notas opcionales",
      "Calendario de clases y asistencia",
    ],
  },
});
