// GET /api/clientes/{id}/cuenta (RF-C4).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerParametrosUrl } from "@/lib/adaptadores";
import { obtenerCuentaCorriente } from "@/servicios/clientes";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function GET(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const resultado = await obtenerCuentaCorriente(usuario, Number(id), leerParametrosUrl(pedido));
    return NextResponse.json(resultado, { status: 200 });
  });
}
