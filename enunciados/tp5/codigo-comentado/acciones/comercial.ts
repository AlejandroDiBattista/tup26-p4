// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca las funciones exportadas como Server Actions (se ejecutan en el servidor).
"use server";
// Server Actions para los formularios (sección 10.3).
// Todas usan "ejecutarAccion" y llaman a LOS MISMOS SERVICIOS que la API REST.
// Ninguna acción contiene reglas de negocio ni validaciones propias.
// [Línea 5] Importa elementos desde 'next/cache'.
import { revalidatePath } from "next/cache";
// [Línea 6] Importa elementos desde '@/lib/adaptadores'.
import { ejecutarAccion } from "@/lib/adaptadores";
// [Línea 7] Importa elementos desde '@/servicios/autenticacion'.
import { cambiarContrasena } from "@/servicios/autenticacion";
// [Línea 8] Importa elementos desde '@/servicios/categorias'.
import { crearCategoria, editarCategoria } from "@/servicios/categorias";
// [Línea 9] Importa elementos desde '@/servicios/clientes'.
import { crearCliente, editarCliente } from "@/servicios/clientes";
// [Línea 10] Importa elementos desde '@/servicios/facturas'.
import { anularFactura, emitirFactura } from "@/servicios/facturas";
// [Línea 11] Importa elementos desde '@/servicios/pagos'.
import { registrarPago } from "@/servicios/pagos";
// [Línea 12] Importa elementos desde '@/servicios/productos'.
import { crearProducto, editarProducto } from "@/servicios/productos";
// [Línea 13] Importa elementos desde '@/servicios/stock'.
import { registrarMovimientoManual } from "@/servicios/stock";
// [Línea 14] Importa elementos desde '@/servicios/usuarios'.
import { crearUsuario, editarUsuario, restablecerContrasena } from "@/servicios/usuarios";

// ---------- Categorías ----------
// [Línea 17] Declara la función asíncrona 'accionCrearCategoria'.
export async function accionCrearCategoria(datosSinValidar: unknown) {
  // [Línea 18] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 19] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await crearCategoria(usuario, datosSinValidar);
    // [Línea 20] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos/categorias");
    revalidatePath("/productos/categorias");
    // [Línea 21] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos");
    revalidatePath("/productos");
    // [Línea 22] Devuelve el valor: resultado;
    return resultado;
  // [Línea 23] Cierra el bloque o estructura (});).
  });
// [Línea 24] Cierra el bloque o estructura (}).
}

// [Línea 26] Declara la función asíncrona 'accionEditarCategoria'.
export async function accionEditarCategoria(idCategoria: number, datosSinValidar: unknown) {
  // [Línea 27] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 28] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await editarCategoria(usuario, idCategoria, datosSinValidar);
    // [Línea 29] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos/categorias");
    revalidatePath("/productos/categorias");
    // [Línea 30] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos");
    revalidatePath("/productos");
    // [Línea 31] Devuelve el valor: resultado;
    return resultado;
  // [Línea 32] Cierra el bloque o estructura (});).
  });
// [Línea 33] Cierra el bloque o estructura (}).
}

// ---------- Productos y stock ----------
// [Línea 36] Declara la función asíncrona 'accionCrearProducto'.
export async function accionCrearProducto(datosSinValidar: unknown) {
  // [Línea 37] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 38] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await crearProducto(usuario, datosSinValidar);
    // [Línea 39] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos");
    revalidatePath("/productos");
    // [Línea 40] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/");
    revalidatePath("/");
    // [Línea 41] Devuelve el valor: resultado;
    return resultado;
  // [Línea 42] Cierra el bloque o estructura (});).
  });
// [Línea 43] Cierra el bloque o estructura (}).
}

// [Línea 45] Declara la función asíncrona 'accionEditarProducto'.
export async function accionEditarProducto(idProducto: number, datosSinValidar: unknown) {
  // [Línea 46] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 47] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await editarProducto(usuario, idProducto, datosSinValidar);
    // [Línea 48] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos");
    revalidatePath("/productos");
    // [Línea 49] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath(`/productos/${idProducto}`);
    revalidatePath(`/productos/${idProducto}`);
    // [Línea 50] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/");
    revalidatePath("/");
    // [Línea 51] Devuelve el valor: resultado;
    return resultado;
  // [Línea 52] Cierra el bloque o estructura (});).
  });
// [Línea 53] Cierra el bloque o estructura (}).
}

// [Línea 55] Declara la función asíncrona 'accionRegistrarMovimientoStock'.
export async function accionRegistrarMovimientoStock(idProducto: number, datosSinValidar: unknown) {
  // [Línea 56] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 57] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await registrarMovimientoManual(usuario, idProducto, datosSinValidar);
    // [Línea 58] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos");
    revalidatePath("/productos");
    // [Línea 59] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath(`/productos/${idProducto}`);
    revalidatePath(`/productos/${idProducto}`);
    // [Línea 60] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/");
    revalidatePath("/");
    // [Línea 61] Devuelve el valor: resultado;
    return resultado;
  // [Línea 62] Cierra el bloque o estructura (});).
  });
// [Línea 63] Cierra el bloque o estructura (}).
}

// ---------- Clientes y pagos ----------
// [Línea 66] Declara la función asíncrona 'accionCrearCliente'.
export async function accionCrearCliente(datosSinValidar: unknown) {
  // [Línea 67] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 68] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await crearCliente(usuario, datosSinValidar);
    // [Línea 69] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes");
    revalidatePath("/clientes");
    // [Línea 70] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes/saldos");
    revalidatePath("/clientes/saldos");
    // [Línea 71] Devuelve el valor: resultado;
    return resultado;
  // [Línea 72] Cierra el bloque o estructura (});).
  });
// [Línea 73] Cierra el bloque o estructura (}).
}

// [Línea 75] Declara la función asíncrona 'accionEditarCliente'.
export async function accionEditarCliente(idCliente: number, datosSinValidar: unknown) {
  // [Línea 76] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 77] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await editarCliente(usuario, idCliente, datosSinValidar);
    // [Línea 78] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes");
    revalidatePath("/clientes");
    // [Línea 79] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath(`/clientes/${idCliente}`);
    revalidatePath(`/clientes/${idCliente}`);
    // [Línea 80] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes/saldos");
    revalidatePath("/clientes/saldos");
    // [Línea 81] Devuelve el valor: resultado;
    return resultado;
  // [Línea 82] Cierra el bloque o estructura (});).
  });
// [Línea 83] Cierra el bloque o estructura (}).
}

// [Línea 85] Declara la función asíncrona 'accionRegistrarPago'.
export async function accionRegistrarPago(idCliente: number, datosSinValidar: unknown) {
  // [Línea 86] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 87] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await registrarPago(usuario, idCliente, datosSinValidar);
    // [Línea 88] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes");
    revalidatePath("/clientes");
    // [Línea 89] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath(`/clientes/${idCliente}`);
    revalidatePath(`/clientes/${idCliente}`);
    // [Línea 90] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes/saldos");
    revalidatePath("/clientes/saldos");
    // [Línea 91] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/");
    revalidatePath("/");
    // [Línea 92] Devuelve el valor: resultado;
    return resultado;
  // [Línea 93] Cierra el bloque o estructura (});).
  });
// [Línea 94] Cierra el bloque o estructura (}).
}

// ---------- Ventas / Facturas ----------
// [Línea 97] Declara la función asíncrona 'accionEmitirFactura'.
export async function accionEmitirFactura(datosSinValidar: unknown) {
  // [Línea 98] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 99] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await emitirFactura(usuario, datosSinValidar);
    // [Línea 100] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/ventas");
    revalidatePath("/ventas");
    // [Línea 101] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos");
    revalidatePath("/productos");
    // [Línea 102] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes");
    revalidatePath("/clientes");
    // [Línea 103] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes/saldos");
    revalidatePath("/clientes/saldos");
    // [Línea 104] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/");
    revalidatePath("/");
    // [Línea 105] Devuelve el valor: resultado;
    return resultado;
  // [Línea 106] Cierra el bloque o estructura (});).
  });
// [Línea 107] Cierra el bloque o estructura (}).
}

// [Línea 109] Declara la función asíncrona 'accionAnularFactura'.
export async function accionAnularFactura(idFactura: number, datosSinValidar: unknown) {
  // [Línea 110] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 111] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await anularFactura(usuario, idFactura, datosSinValidar);
    // [Línea 112] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/ventas");
    revalidatePath("/ventas");
    // [Línea 113] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath(`/ventas/${idFactura}`);
    revalidatePath(`/ventas/${idFactura}`);
    // [Línea 114] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/productos");
    revalidatePath("/productos");
    // [Línea 115] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes");
    revalidatePath("/clientes");
    // [Línea 116] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/clientes/saldos");
    revalidatePath("/clientes/saldos");
    // [Línea 117] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/");
    revalidatePath("/");
    // [Línea 118] Devuelve el valor: resultado;
    return resultado;
  // [Línea 119] Cierra el bloque o estructura (});).
  });
// [Línea 120] Cierra el bloque o estructura (}).
}

// ---------- Usuarios y contraseña ----------
// [Línea 123] Declara la función asíncrona 'accionCrearUsuario'.
export async function accionCrearUsuario(datosSinValidar: unknown) {
  // [Línea 124] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 125] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await crearUsuario(usuario, datosSinValidar);
    // [Línea 126] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/usuarios");
    revalidatePath("/usuarios");
    // [Línea 127] Devuelve el valor: resultado;
    return resultado;
  // [Línea 128] Cierra el bloque o estructura (});).
  });
// [Línea 129] Cierra el bloque o estructura (}).
}

// [Línea 131] Declara la función asíncrona 'accionEditarUsuario'.
export async function accionEditarUsuario(idUsuario: number, datosSinValidar: unknown) {
  // [Línea 132] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 133] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await editarUsuario(usuario, idUsuario, datosSinValidar);
    // [Línea 134] Actualiza la caché de Next.js en la ruta indicada para refrescar los datos en pantalla: revalidatePath("/usuarios");
    revalidatePath("/usuarios");
    // [Línea 135] Devuelve el valor: resultado;
    return resultado;
  // [Línea 136] Cierra el bloque o estructura (});).
  });
// [Línea 137] Cierra el bloque o estructura (}).
}

// [Línea 139] Declara la función asíncrona 'accionRestablecerContrasena'.
export async function accionRestablecerContrasena(idUsuario: number) {
  // [Línea 140] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 141] Devuelve el valor: restablecerContrasena(usuario, idUsuario);
    return restablecerContrasena(usuario, idUsuario);
  // [Línea 142] Cierra el bloque o estructura (});).
  });
// [Línea 143] Cierra el bloque o estructura (}).
}

// [Línea 145] Declara la función asíncrona 'accionCambiarContrasena'.
export async function accionCambiarContrasena(datosSinValidar: unknown) {
  // [Línea 146] Devuelve el valor: ejecutarAccion(async (usuario) => {
  return ejecutarAccion(async (usuario) => {
    // [Línea 147] Espera a que se complete la operación asíncrona: await cambiarContrasena(usuario, datosSinValidar);
    await cambiarContrasena(usuario, datosSinValidar);
    // [Línea 148] Devuelve el valor: { mensaje: "Contraseña actualizada." };
    return { mensaje: "Contraseña actualizada." };
  // [Línea 149] Cierra el bloque o estructura (});).
  });
// [Línea 150] Cierra el bloque o estructura (}).
}
