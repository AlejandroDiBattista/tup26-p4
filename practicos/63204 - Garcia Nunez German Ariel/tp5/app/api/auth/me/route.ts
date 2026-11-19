// GET /api/auth/me (RF-U2).
// Devuelve los datos del usuario conectado o 401 si no hay sesión válida.
import { NextResponse } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";

export async function GET() {
  return conSesionApi(async (usuario) => NextResponse.json(usuario, { status: 200 }));
}
