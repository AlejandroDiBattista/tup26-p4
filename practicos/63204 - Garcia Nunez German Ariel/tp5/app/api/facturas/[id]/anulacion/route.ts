// Endpoint: POST /api/facturas/{id}/anulacion (RF-V9, solo administrador).
// Anula una factura emitida, reingresa la mercaderia al stock y acredita la deuda si fue en cuenta corriente.

/* importamos NextResponse y NextRequest de Next.js */
import { NextResponse, type NextRequest } from "next/server";
/* adaptadores para verificar sesion y leer el cuerpo JSON con el motivo de la anulacion */
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
/* funcion del servicio que contiene la transaccion de anulacion */
import { anularFactura } from "@/servicios/facturas";

/* tipado del contexto con la promesa de parametros de la url */
type ContextoRuta = { params: Promise<{ id: string }> };

/* manejador de la peticion POST para anular */
export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    /* extraemos el id de la factura desde la ruta */
    const { id } = await contexto.params;
    /* leemos el cuerpo con { motivo: "El cliente cancelo la compra" } */
    const cuerpo = await leerJsonPedido(pedido);
    /* llamamos a anularFactura; si el usuario no es admin o la factura ya estaba anulada, arrojara error */
    const facturaAnulada = await anularFactura(usuario, Number(id), cuerpo);
    /* devolvemos la factura con su nuevo estado 'anulada' */
    return NextResponse.json(facturaAnulada, { status: 200 });
  });
}
