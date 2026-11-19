// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// GET /api/auth/me (RF-U2).
// Devuelve los datos del usuario conectado o 401 si no hay sesión válida.
// [Línea 3] Importa elementos desde 'next/server'.
import { NextResponse } from "next/server";
// [Línea 4] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi } from "@/lib/adaptadores";

// [Línea 6] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP GET.
export async function GET() {
  // [Línea 7] Devuelve el valor: conSesionApi(async (usuario) => NextResponse.json(usuario, { status: 200 }));
  return conSesionApi(async (usuario) => NextResponse.json(usuario, { status: 200 }));
// [Línea 8] Cierra el bloque o estructura (}).
}
