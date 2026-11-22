// GET y POST /api/clientes (RF-C1, RF-C2, RF-C6, RF-V2).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
import { crearCliente, listarClientes } from "@/servicios/clientes";

export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarClientes(usuario, leerParametrosUrl(pedido));
    return NextResponse.json(resultado, { status: 200 });
  });
}

export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const clienteCreado = await crearCliente(usuario, cuerpo);
    return NextResponse.json(clienteCreado, { status: 201 });
  });
}
