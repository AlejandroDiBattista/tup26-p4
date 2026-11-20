// PATCH /api/usuarios/{id} (RF-U4, solo administrador).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { editarUsuario } from "@/servicios/usuarios";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const usuarioActualizado = await editarUsuario(usuario, Number(id), cuerpo);
    return NextResponse.json(usuarioActualizado, { status: 200 });
  });
}
