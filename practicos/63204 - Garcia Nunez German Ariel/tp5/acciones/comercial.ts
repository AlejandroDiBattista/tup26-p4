/* ==========================================================================
   SERVER ACTIONS COMERCIALES DE NEXT.JS (ACCIONES/COMERCIAL.TS)
   Este archivo expone funciones asíncronas de servidor que son llamadas directamente
   desde formularios interactivos de React (Client Components).
   
   REGLA DE DISEÑO ARQUITECTÓNICO:
   Ninguna acción contiene reglas de negocio ni validaciones propias:
   1. Usan el adaptador 'ejecutarAccion' para verificar sesión y capturar errores.
   2. Delegan la operación a LOS MISMOS SERVICIOS que usa la API REST.
   3. Utilizan 'revalidatePath' de Next.js para purgar la caché de las páginas afectadas
      y forzar que el navegador muestre los datos recién guardados de inmediato.
   ========================================================================== */

/* "use server" marca todas las funciones exportadas de este archivo como Server Actions ejecutadas en el servidor */
"use server";

/* importamos revalidatePath de Next.js para invalidar la caché de rutas del servidor */
import { revalidatePath } from "next/cache";

/* importamos el adaptador que envuelve la ejecución y el manejo de errores */
import { ejecutarAccion } from "@/lib/adaptadores";

/* importamos las funciones de la capa de servicios que contienen la verdadera lógica de negocio */
import { cambiarContrasena } from "@/servicios/autenticacion";
import { crearCategoria, editarCategoria } from "@/servicios/categorias";
import { crearCliente, editarCliente } from "@/servicios/clientes";
import { anularFactura, emitirFactura } from "@/servicios/facturas";
import { registrarPago } from "@/servicios/pagos";
import { crearProducto, editarProducto } from "@/servicios/productos";
import { registrarMovimientoManual } from "@/servicios/stock";
import { crearUsuario, editarUsuario, restablecerContrasena } from "@/servicios/usuarios";

/* ==========================================================================
   ACCIONES DE CATEGORÍAS
   ========================================================================== */

/* acción para crear una nueva categoría desde un modal de formulario */
export async function accionCrearCategoria(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearCategoria(usuario, datosSinValidar);
    /* invalidamos la caché de la lista de categorías y del catálogo de productos */
    revalidatePath("/productos/categorias");
    revalidatePath("/productos");
    return resultado;
  });
}

/* acción para modificar el nombre o estado de una categoría */
export async function accionEditarCategoria(idCategoria: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarCategoria(usuario, idCategoria, datosSinValidar);
    revalidatePath("/productos/categorias");
    revalidatePath("/productos");
    return resultado;
  });
}

/* ==========================================================================
   ACCIONES DE PRODUCTOS Y MOVIMIENTOS DE STOCK
   ========================================================================== */

/* acción para dar de alta un producto */
export async function accionCrearProducto(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearProducto(usuario, datosSinValidar);
    revalidatePath("/productos");
    revalidatePath("/"); // revalida el tablero principal
    return resultado;
  });
}

/* acción para editar un producto */
export async function accionEditarProducto(idProducto: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarProducto(usuario, idProducto, datosSinValidar);
    revalidatePath("/productos");
    revalidatePath(`/productos/${idProducto}`);
    revalidatePath("/");
    return resultado;
  });
}

/* acción para registrar un ingreso o egreso manual de stock (ajuste de inventario) */
export async function accionRegistrarMovimientoStock(idProducto: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await registrarMovimientoManual(usuario, idProducto, datosSinValidar);
    revalidatePath("/productos");
    revalidatePath(`/productos/${idProducto}`);
    revalidatePath("/");
    return resultado;
  });
}

/* ==========================================================================
   ACCIONES DE CLIENTES Y COBRANZAS
   ========================================================================== */

/* acción para crear un cliente nuevo */
export async function accionCrearCliente(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearCliente(usuario, datosSinValidar);
    revalidatePath("/clientes");
    revalidatePath("/clientes/saldos");
    return resultado;
  });
}

/* acción para editar datos o cuenta corriente de un cliente */
export async function accionEditarCliente(idCliente: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarCliente(usuario, idCliente, datosSinValidar);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${idCliente}`);
    revalidatePath("/clientes/saldos");
    return resultado;
  });
}

/* acción para cobrar un recibo de pago a un cliente en cuenta corriente */
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

/* ==========================================================================
   ACCIONES DE VENTAS / FACTURAS
   ========================================================================== */

/* acción para emitir una factura completa */
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

/* acción para anular una factura emitida (solo administrador con motivo) */
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

/* ==========================================================================
   ACCIONES DE USUARIOS Y CONTRASEÑAS
   ========================================================================== */

/* acción para crear un nuevo usuario */
export async function accionCrearUsuario(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await crearUsuario(usuario, datosSinValidar);
    revalidatePath("/usuarios");
    return resultado;
  });
}

/* acción para editar rol o estado de un usuario */
export async function accionEditarUsuario(idUsuario: number, datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    const resultado = await editarUsuario(usuario, idUsuario, datosSinValidar);
    revalidatePath("/usuarios");
    return resultado;
  });
}

/* acción para restablecer la contraseña temporal de un usuario */
export async function accionRestablecerContrasena(idUsuario: number) {
  return ejecutarAccion(async (usuario) => {
    return restablecerContrasena(usuario, idUsuario);
  });
}

/* acción para que el usuario en sesión cambie su propia contraseña */
export async function accionCambiarContrasena(datosSinValidar: unknown) {
  return ejecutarAccion(async (usuario) => {
    await cambiarContrasena(usuario, datosSinValidar);
    return { mensaje: "Contraseña actualizada." };
  });
}
