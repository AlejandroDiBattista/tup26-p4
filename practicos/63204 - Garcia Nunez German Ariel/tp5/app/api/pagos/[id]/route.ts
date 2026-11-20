// GET /api/pagos/{id} (RF-C5).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";
import { obtenerPago } from "@/servicios/pagos";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const pago = await obtenerPago(usuario, Number(id));
    return NextResponse.json(pago, { status: 200 });
  });
}
