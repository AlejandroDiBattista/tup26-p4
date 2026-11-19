// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: acciones/comercial.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use server': indica que estas funciones se ejecutan únicamente en el servidor
"use server";
// Server Actions para los formularios (sección 10.3).
// Todas usan "ejecutarAccion" y llaman a LOS MISMOS SERVICIOS que la API REST.
// Ninguna acción contiene reglas de negocio ni validaciones propias.
import { revalidatePath } from "next/cache";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { ejecutarAccion } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { cambiarContrasena } from "@/servicios/autenticacion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { crearCategoria, editarCategoria } from "@/servicios/categorias";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { crearCliente, editarCliente } from "@/servicios/clientes";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { anularFactura, emitirFactura } from "@/servicios/facturas";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { registrarPago } from "@/servicios/pagos";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { crearProducto, editarProducto } from "@/servicios/productos";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { registrarMovimientoManual } from "@/servicios/stock";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { crearUsuario, editarUsuario, restablecerContrasena } from "@/servicios/usuarios";

// ---------- Categorías ----------
export async function accionCrearCategoria(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearCategoria(usuario, datosSinValidar);
    revalidatePath("/productos/categorias");
    revalidatePath("/productos");
    return resultado;
  });
}

export async function accionEditarCategoria(idCategoria: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarCategoria(usuario, idCategoria, datosSinValidar);
    revalidatePath("/productos/categorias");
    revalidatePath("/productos");
    return resultado;
  });
}

// ---------- Productos y stock ----------
export async function accionCrearProducto(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearProducto(usuario, datosSinValidar);
    revalidatePath("/productos");
    revalidatePath("/");
    return resultado;
  });
}

export async function accionEditarProducto(idProducto: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarProducto(usuario, idProducto, datosSinValidar);
    revalidatePath("/productos");
    revalidatePath(`/productos/${idProducto}`);
    revalidatePath("/");
    return resultado;
  });
}

export async function accionRegistrarMovimientoStock(idProducto: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await registrarMovimientoManual(usuario, idProducto, datosSinValidar);
    revalidatePath("/productos");
    revalidatePath(`/productos/${idProducto}`);
    revalidatePath("/");
    return resultado;
  });
}

// ---------- Clientes y pagos ----------
export async function accionCrearCliente(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearCliente(usuario, datosSinValidar);
    revalidatePath("/clientes");
    revalidatePath("/clientes/saldos");
    return resultado;
  });
}

export async function accionEditarCliente(idCliente: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarCliente(usuario, idCliente, datosSinValidar);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${idCliente}`);
    revalidatePath("/clientes/saldos");
    return resultado;
  });
}

export async function accionRegistrarPago(idCliente: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await registrarPago(usuario, idCliente, datosSinValidar);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${idCliente}`);
    revalidatePath("/clientes/saldos");
    revalidatePath("/");
    return resultado;
  });
}

// ---------- Ventas / Facturas ----------
export async function accionEmitirFactura(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await emitirFactura(usuario, datosSinValidar);
    revalidatePath("/ventas");
    revalidatePath("/productos");
    revalidatePath("/clientes");
    revalidatePath("/clientes/saldos");
    revalidatePath("/");
    return resultado;
  });
}

export async function accionAnularFactura(idFactura: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await anularFactura(usuario, idFactura, datosSinValidar);
    revalidatePath("/ventas");
    revalidatePath(`/ventas/${idFactura}`);
    revalidatePath("/productos");
    revalidatePath("/clientes");
    revalidatePath("/clientes/saldos");
    revalidatePath("/");
    return resultado;
  });
}

// ---------- Usuarios y contraseña ----------
export async function accionCrearUsuario(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearUsuario(usuario, datosSinValidar);
    revalidatePath("/usuarios");
    return resultado;
  });
}

export async function accionEditarUsuario(idUsuario: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarUsuario(usuario, idUsuario, datosSinValidar);
    revalidatePath("/usuarios");
    return resultado;
  });
}

export async function accionRestablecerContrasena(idUsuario: number) {
  return ejecutarAccion(async (usuario) => {
    return restablecerContrasena(usuario, idUsuario);
  });
}

export async function accionCambiarContrasena(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    await cambiarContrasena(usuario, datosSinValidar);
    return { mensaje: "Contraseña actualizada." };
  });
}
