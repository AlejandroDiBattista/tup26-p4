// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// GET y POST /api/clientes (RF-C1, RF-C2, RF-C6, RF-V2).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/clientes'.
import { crearCliente, listarClientes } from "@/servicios/clientes";

// [Línea 6] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP GET.
export async function GET(pedido: NextRequest) {
  // [Línea 7] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 8] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await listarClientes(usuario, leerParametrosUrl(pedido));
    // [Línea 9] Devuelve el valor: NextResponse.json(resultado, { status: 200 });
    return NextResponse.json(resultado, { status: 200 });
  // [Línea 10] Cierra el bloque o estructura (});).
  });
// [Línea 11] Cierra el bloque o estructura (}).
}

// [Línea 13] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP POST.
export async function POST(pedido: NextRequest) {
  // [Línea 14] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 15] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cuerpo'.
    const cuerpo = await leerJsonPedido(pedido);
    // [Línea 16] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'clienteCreado'.
    const clienteCreado = await crearCliente(usuario, cuerpo);
    // [Línea 17] Devuelve el valor: NextResponse.json(clienteCreado, { status: 201 });
    return NextResponse.json(clienteCreado, { status: 201 });
  // [Línea 18] Cierra el bloque o estructura (});).
  });
// [Línea 19] Cierra el bloque o estructura (}).
}
