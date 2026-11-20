// PATCH /api/categorias/{id} (RF-P7, solo administrador).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { editarCategoria } from "@/servicios/categorias";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const categoriaActualizada = await editarCategoria(usuario, Number(id), cuerpo);
    return NextResponse.json(categoriaActualizada, { status: 200 });
  });
}
