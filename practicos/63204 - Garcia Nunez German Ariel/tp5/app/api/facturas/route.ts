// Controladores de API REST para facturas (GET y POST /api/facturas). RF-V1 a RF-V6, RF-V8.

/* importamos NextResponse para devolver respuestas HTTP con codigo de estado y formato JSON, y el tipo NextRequest para tipar la peticion entrante */
import { NextResponse, type NextRequest } from "next/server";

/* conSesionApi: envuelve la funcion para validar la cookie de sesion antes de atender el pedido; si no hay sesion devuelve 401 Unauthorized
   leerJsonPedido: lee y parsea el cuerpo JSON enviado por el cliente
   leerParametrosUrl: extrae los parametros de busqueda de la url (?q=..., &desde=..., etc.)
*/
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";

/* importamos las funciones de la capa de servicios donde reside la logica pura de base de datos */
import { emitirFactura, listarFacturas } from "@/servicios/facturas";

/* METODO GET: se ejecuta cuando el frontend consulta /api/facturas para listar o buscar comprobantes */
export async function GET(pedido: NextRequest) {
  /* conSesionApi nos pasa el 'usuario' autenticado una vez que valido su token */
  return conSesionApi(async (usuario) => {
    /* extraemos los filtros de la url y llamamos al servicio para buscar en la base de datos */
    const resultado = await listarFacturas(usuario, leerParametrosUrl(pedido));
    /* devolvemos la lista de facturas en formato JSON con codigo de estado HTTP 200 (OK) */
    return NextResponse.json(resultado, { status: 200 });
  });
}

/* METODO POST: se ejecuta cuando el mostrador confirma una venta y envia los datos a /api/facturas */
export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    /* leemos el cuerpo de la peticion HTTP que contiene { clienteId, items, pago } */
    const cuerpo = await leerJsonPedido(pedido);
    /* ejecutamos la emision de la factura (valida Zod, abre transaccion, descuenta stock y graba) */
    const facturaCreada = await emitirFactura(usuario, cuerpo);
    /* devolvemos el comprobante generado con codigo HTTP 201 (Created: nuevo recurso creado en la db) */
    return NextResponse.json(facturaCreada, { status: 201 });
  });
}
