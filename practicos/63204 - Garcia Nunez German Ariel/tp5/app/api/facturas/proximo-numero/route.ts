// Endpoint informativo: GET /api/facturas/proximo-numero (RF-V1).
// Sirve para mostrar en la esquina superior de la pantalla que numero de factura se va a emitir.

/* importamos NextResponse para responder en JSON */
import { NextResponse } from "next/server";
/* conSesionApi: protege la ruta para que solo usuarios autenticados puedan consultarla */
import { conSesionApi } from "@/lib/adaptadores";
/* funcion del servicio que consulta en la base de datos el maximo numero emitido y le suma 1 */
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";

/* export async function GET: maneja las peticiones GET a esta ruta */
export async function GET() {
  return conSesionApi(async (usuario) => {
    /* calculamos el numero siguiente para el punto de venta activo */
    const resultado = await obtenerProximoNumeroFactura(usuario);
    /* devolvemos { puntoVenta: 1, numero: 24, numeroFormateado: "0001-00000024" } */
    return NextResponse.json(resultado, { status: 200 });
  });
}
