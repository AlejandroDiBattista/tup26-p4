// POST /api/clientes/{id}/pagos (RF-C5).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { registrarPago } from "@/servicios/pagos";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const pago = await registrarPago(usuario, Number(id), cuerpo);
    return NextResponse.json(pago, { status: 201 });
  });
}
