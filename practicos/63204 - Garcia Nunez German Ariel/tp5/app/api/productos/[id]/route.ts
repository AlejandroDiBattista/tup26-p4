// GET y PATCH /api/productos/{id} (RF-P1, RF-P2, RF-P3).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { editarProducto, obtenerProducto } from "@/servicios/productos";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const producto = await obtenerProducto(usuario, Number(id));
    return NextResponse.json(producto, { status: 200 });
  });
}

export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const productoEditado = await editarProducto(usuario, Number(id), cuerpo);
    return NextResponse.json(productoEditado, { status: 200 });
  });
}
