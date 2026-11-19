// GET y POST /api/productos/{id}/movimientos (RF-P4, RF-P5, RF-P6).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
import { listarMovimientosDeProducto, registrarMovimientoManual } from "@/servicios/stock";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function GET(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const resultado = await listarMovimientosDeProducto(
      usuario,
      Number(id),
      leerParametrosUrl(pedido),
    );
    return NextResponse.json(resultado, { status: 200 });
  });
}

export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const movimiento = await registrarMovimientoManual(usuario, Number(id), cuerpo);
    return NextResponse.json(movimiento, { status: 201 });
  });
}
