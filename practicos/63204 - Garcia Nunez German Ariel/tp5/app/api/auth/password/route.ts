// PUT /api/auth/password (RF-U5).
// Permite al usuario autenticado cambiar su propia contraseña.
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { cambiarContrasena } from "@/servicios/autenticacion";

export async function PUT(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    await cambiarContrasena(usuario, cuerpo);
    return new NextResponse(null, { status: 204 });
  });
}
