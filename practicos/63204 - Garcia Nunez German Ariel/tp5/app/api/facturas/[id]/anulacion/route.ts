// POST /api/facturas/{id}/anulacion (RF-V9, solo administrador).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { anularFactura } from "@/servicios/facturas";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const facturaAnulada = await anularFactura(usuario, Number(id), cuerpo);
    return NextResponse.json(facturaAnulada, { status: 200 });
  });
}
