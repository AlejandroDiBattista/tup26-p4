// GET /api/facturas/{id} (RF-V7).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";
import { obtenerFactura } from "@/servicios/facturas";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const factura = await obtenerFactura(usuario, Number(id));
    return NextResponse.json(factura, { status: 200 });
  });
}
