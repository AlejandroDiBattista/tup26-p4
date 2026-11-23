// Endpoint: GET /api/facturas/{id} (RF-V7).
// Trae el detalle completo de una factura por su ID para mostrarla o imprimirla.

/* importamos las herramientas de servidor de Next.js */
import { NextResponse, type NextRequest } from "next/server";
/* conSesionApi garantiza que solo usuarios con sesion valida puedan ver facturas */
import { conSesionApi } from "@/lib/adaptadores";
/* funcion del servicio que hace los joins entre facturas, clientes, items y usuarios */
import { obtenerFactura } from "@/servicios/facturas";

/* definimos el tipo para los parametros de la ruta dinamica; en Next.js los params son una promesa */
type ContextoRuta = { params: Promise<{ id: string }> };

/* manejador de la peticion GET que recibe el id en la url */
export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    /* esperamos a que se resuelva la promesa de params para obtener el id */
    const { id } = await contexto.params;
    /* convertimos el id a numero y consultamos en la base de datos */
    const factura = await obtenerFactura(usuario, Number(id));
    /* devolvemos la factura con sus renglones y totales en formato JSON */
    return NextResponse.json(factura, { status: 200 });
  });
}
