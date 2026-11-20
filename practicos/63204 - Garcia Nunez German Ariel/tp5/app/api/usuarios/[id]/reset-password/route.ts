// POST /api/usuarios/{id}/reset-password (RF-U5, solo administrador).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";
import { restablecerContrasena } from "@/servicios/usuarios";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function POST(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const resultado = await restablecerContrasena(usuario, Number(id));
    return NextResponse.json(resultado, { status: 200 });
  });
}
