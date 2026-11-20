// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/clientes/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET y POST /api/clientes (RF-C1, RF-C2, RF-C6, RF-V2).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { crearCliente, listarClientes } from "@/servicios/clientes";

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarClientes(usuario, leerParametrosUrl(pedido));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(resultado, { status: 200 });
  });
}

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const clienteCreado = await crearCliente(usuario, cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(clienteCreado, { status: 201 });
  });
}
