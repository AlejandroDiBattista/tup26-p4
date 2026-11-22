// GET y POST /api/facturas (RF-V1 a RF-V6, RF-V8).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
import { emitirFactura, listarFacturas } from "@/servicios/facturas";

export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarFacturas(usuario, leerParametrosUrl(pedido));
    return NextResponse.json(resultado, { status: 200 });
  });
}

export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const facturaCreada = await emitirFactura(usuario, cuerpo);
    return NextResponse.json(facturaCreada, { status: 201 });
  });
}
