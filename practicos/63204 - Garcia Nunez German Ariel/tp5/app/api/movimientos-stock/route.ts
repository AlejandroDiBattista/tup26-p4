// GET /api/movimientos-stock (RF-P6).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerParametrosUrl } from "@/lib/adaptadores";
import { listarMovimientosStock } from "@/servicios/stock";

export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarMovimientosStock(usuario, leerParametrosUrl(pedido));
    return NextResponse.json(resultado, { status: 200 });
  });
}
