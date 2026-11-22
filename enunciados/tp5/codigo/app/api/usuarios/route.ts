// GET y POST /api/usuarios (RF-U4, solo administrador).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
import { crearUsuario, listarUsuarios } from "@/servicios/usuarios";

export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarUsuarios(usuario, leerParametrosUrl(pedido));
    return NextResponse.json(resultado, { status: 200 });
  });
}

export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const usuarioCreado = await crearUsuario(usuario, cuerpo);
    return NextResponse.json(usuarioCreado, { status: 201 });
  });
}
