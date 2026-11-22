// GET y POST /api/productos (RF-P1 y RF-P2).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
import { crearProducto, listarProductos } from "@/servicios/productos";

export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarProductos(usuario, leerParametrosUrl(pedido));
    return NextResponse.json(resultado, { status: 200 });
  });
}

export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const productoCreado = await crearProducto(usuario, cuerpo);
    return NextResponse.json(productoCreado, { status: 201 });
  });
}
