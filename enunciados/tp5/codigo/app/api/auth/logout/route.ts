// POST /api/auth/logout (RF-U1).
// Cierra la sesión borrando la cookie httpOnly y responde 204.
import { NextResponse } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";
import { NOMBRE_COOKIE_SESION } from "@/lib/sesion";

export async function POST() {
  return conSesionApi(async () => {
    const respuesta = new NextResponse(null, { status: 204 });
    respuesta.cookies.delete(NOMBRE_COOKIE_SESION);
    return respuesta;
  });
}
