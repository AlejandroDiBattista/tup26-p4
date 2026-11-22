// GET y POST /api/categorias (RF-P7).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
import { crearCategoria, listarCategorias } from "@/servicios/categorias";

export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const lista = await listarCategorias(usuario, leerParametrosUrl(pedido));
    return NextResponse.json(lista, { status: 200 });
  });
}

export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const categoriaCreada = await crearCategoria(usuario, cuerpo);
    return NextResponse.json(categoriaCreada, { status: 201 });
  });
}
