// GET y PATCH /api/clientes/{id} (RF-C2, RF-C3, RF-C7).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { editarCliente, obtenerCliente } from "@/servicios/clientes";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cliente = await obtenerCliente(usuario, Number(id));
    return NextResponse.json(cliente, { status: 200 });
  });
}

export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const clienteEditado = await editarCliente(usuario, Number(id), cuerpo);
    return NextResponse.json(clienteEditado, { status: 200 });
  });
}
