// GET /api/facturas/proximo-numero (RF-V1).
import { NextResponse } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";

export async function GET() {
  return conSesionApi(async (usuario) => {
    const resultado = await obtenerProximoNumeroFactura(usuario);
    return NextResponse.json(resultado, { status: 200 });
  });
}
