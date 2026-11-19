// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/clientes/[id]/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET y PATCH /api/clientes/{id} (RF-C2, RF-C3, RF-C7).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { editarCliente, obtenerCliente } from "@/servicios/clientes";

type ContextoRuta = { params: Promise<{ id: string }> };

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cliente = await obtenerCliente(usuario, Number(id));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(cliente, { status: 200 });
  });
}

// Endpoint API PUT/PATCH: recibe datos para modificar un registro existente
export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const clienteEditado = await editarCliente(usuario, Number(id), cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(clienteEditado, { status: 200 });
  });
}
