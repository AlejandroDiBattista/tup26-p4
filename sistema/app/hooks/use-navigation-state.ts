import { appBasePath, appPath } from "@agent-native/core/client/api-path";
import { useAgentRouteState } from "@agent-native/core/client/navigation";

import { TAB_ID } from "@/lib/tab-id";

export interface NavigationState {
  view: string;
  path?: string;
  threadId?: string;
  /** Comisión abierta en /cursos/:courseId. */
  courseId?: string;
  /** Legajo del alumno abierto en /alumnos/:legajo. */
  legajo?: string;
  /** Trabajo seleccionado en /trabajos. */
  assessmentId?: string;
  /** Clase seleccionada en /asistencia. */
  classId?: string;
}

export function useNavigationState() {
  useAgentRouteState<NavigationState>({
    browserTabId: TAB_ID,
    requestSource: TAB_ID,
    getNavigationState: ({ pathname, searchParams }) => {
      const threadId = threadIdFromPath(pathname);
      const legajo = legajoFromPath(pathname);
      const courseId =
        courseIdFromPath(pathname) ??
        (pathname.startsWith("/asistencia") || pathname.startsWith("/trabajos")
          ? searchParams.get("curso")
          : null);
      const assessmentId = pathname.startsWith("/trabajos")
        ? searchParams.get("trabajo")
        : null;
      const classId = pathname.startsWith("/asistencia")
        ? searchParams.get("clase")
        : null;
      return {
        view: viewForPath(pathname),
        path: appPath(pathname),
        ...(threadId ? { threadId } : {}),
        ...(courseId ? { courseId } : {}),
        ...(legajo ? { legajo } : {}),
        ...(assessmentId ? { assessmentId } : {}),
        ...(classId ? { classId } : {}),
      };
    },
    getCommandPath: (command) =>
      routerPath(command.path || pathForCommand(command)),
  });
}

function threadIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/chat\/([^/]+)/);
  if (!match) return null;
  try {
    const value = decodeURIComponent(match[1]).trim();
    return value || null;
  } catch {
    return null;
  }
}

function courseIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/cursos\/([^/?]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).trim() || null;
  } catch {
    return null;
  }
}

function legajoFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/alumnos\/([^/?]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).trim() || null;
  } catch {
    return null;
  }
}

function viewForPath(pathname: string): string {
  if (/^\/alumnos\/[^/]+/.test(pathname)) return "alumno";
  if (pathname.startsWith("/alumnos")) return "alumnos";
  if (pathname.startsWith("/asistencia")) return "asistencia";
  if (pathname.startsWith("/trabajos")) return "trabajos";
  if (pathname.startsWith("/cursos")) return "cursos";
  if (isChatPath(pathname)) return "chat";
  if (pathname.startsWith("/database")) return "database";
  if (pathname.startsWith("/extensions")) return "extensions";
  if (pathname.startsWith("/observability")) return "observability";
  if (pathname.startsWith("/settings/agent") || pathname.startsWith("/agent")) {
    return "agent";
  }
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/team")) return "settings";
  return "chat";
}

function pathForView(view?: string): string {
  switch (view) {
    case "chat":
    case "home":
    case "ask":
      return "/";
    case "cursos":
    case "courses":
      return "/cursos";
    case "alumno":
    case "student":
      return "/alumnos";
    case "alumnos":
    case "students":
      return "/alumnos";
    case "asistencia":
    case "attendance":
      return "/asistencia";
    case "trabajos":
    case "works":
    case "assignments":
      return "/trabajos";
    case "database":
      return "/database";
    case "extensions":
      return "/extensions";
    case "observability":
      return "/observability";
    case "agent":
      return "/settings/agent";
    case "settings":
      return "/settings";
    case "team":
      return "/settings/organization";
    default:
      return "/";
  }
}

function pathForCommand(command: any): string {
  const path = pathForView(command?.view);
  if (path === "/alumnos") {
    const legajo =
      typeof command?.legajo === "string" ? command.legajo.trim() : "";
    if (!legajo) return "/alumnos";
    return `/alumnos/${encodeURIComponent(legajo)}`;
  }
  if (path === "/cursos") {
    const courseId =
      typeof command?.courseId === "string" ? command.courseId.trim() : "";
    if (!courseId) return path;
    return `/cursos/${encodeURIComponent(courseId)}`;
  }
  if (path === "/asistencia" || path === "/trabajos") {
    const params = new URLSearchParams();
    const courseId =
      typeof command?.courseId === "string" ? command.courseId.trim() : "";
    if (courseId) params.set("curso", courseId);
    if (path === "/asistencia") {
      const classId =
        typeof command?.classId === "string" ? command.classId.trim() : "";
      if (classId) params.set("clase", classId);
    } else {
      const assessmentId =
        typeof command?.assessmentId === "string"
          ? command.assessmentId.trim()
          : "";
      if (assessmentId) params.set("trabajo", assessmentId);
    }
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }
  if (path !== "/") return path;
  const threadId =
    typeof command?.threadId === "string" ? command.threadId.trim() : "";
  return threadId ? `/chat/${encodeURIComponent(threadId)}` : "/";
}

function routerPath(path: string): string {
  const basePath = appBasePath();
  if (!basePath) return path;
  if (path === basePath) return "/";
  if (path.startsWith(`${basePath}/`)) {
    return path.slice(basePath.length) || "/";
  }
  return path;
}

function isChatPath(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/chat/");
}
