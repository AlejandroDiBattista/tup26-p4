// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de USUARIOS (solo administrador). RF-U3, RF-U4, RF-U5.
// [Línea 2] Importa elementos desde 'bcryptjs'.
import bcrypt from "bcryptjs";
// [Línea 3] Importa elementos desde 'node:crypto'.
import { randomInt } from "node:crypto";
// [Línea 4] Importa elementos desde 'drizzle-orm'.
import { and, count, eq, like, or, asc } from "drizzle-orm";
// [Línea 5] Importa elementos desde '@/basedatos/conexion'.
import { db } from "@/basedatos/conexion";
// [Línea 6] Importa elementos desde '@/basedatos/esquema'.
import { usuarios } from "@/basedatos/esquema";
// [Línea 7] Importa elementos desde '@/esquemas/usuarios'.
import { esquemaUsuarioEdicion, esquemaUsuarioNuevo } from "@/esquemas/usuarios";
// [Línea 8] Importa elementos desde './errores'.
import { ApiError, noEncontrado } from "./errores";
// [Línea 9] Importa elementos desde './comunes'.
import { exigirAdmin, leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";
// [Línea 10] Importa elementos desde './autenticacion'.
import { aUsuarioPublico } from "./autenticacion";

// [Línea 12] Define el tipo de datos 'ParametrosListado' en TypeScript.
type ParametrosListado = { q?: string; activo?: string; page?: string; pageSize?: string };

// RF-U4: listado de usuarios, con búsqueda y paginado. Nunca devuelve el hash.
// [Línea 15] Declara la función asíncrona 'listarUsuarios'.
export async function listarUsuarios(usuario: UsuarioSesion, parametros: ParametrosListado) {
  // [Línea 16] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 17] Declara '{ pagina, tamanoPagina, salto }' y le asigna el valor resultante.
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  // [Línea 19] Declara 'condiciones' y le asigna el valor resultante.
  const condiciones = [];
  // [Línea 20] Verifica la condición: if (parametros.q) {
  if (parametros.q) {
    // [Línea 21] Declara 'textoBuscado' y le asigna el valor resultante.
    const textoBuscado = `%${parametros.q}%`;
    // [Línea 22] Ejecuta o evalúa: condiciones.push(or(like(usuarios.nombre, textoBuscado), like(usuarios.email, te
    condiciones.push(or(like(usuarios.nombre, textoBuscado), like(usuarios.email, textoBuscado)));
  // [Línea 23] Cierra el bloque o estructura (}).
  }
  // [Línea 24] Verifica la condición: if (parametros.activo === "true") condiciones.push(eq(usuarios.activo, true));
  if (parametros.activo === "true") condiciones.push(eq(usuarios.activo, true));
  // [Línea 25] Verifica la condición: if (parametros.activo === "false") condiciones.push(eq(usuarios.activo, false));
  if (parametros.activo === "false") condiciones.push(eq(usuarios.activo, false));
  // [Línea 26] Declara 'filtro' y le asigna el valor resultante.
  const filtro = and(...condiciones);

  // [Línea 28] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filas'.
  const filas = await db
    // [Línea 29] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select()
    // [Línea 30] Define la tabla origen de la consulta SQL: .from(usuarios)
    .from(usuarios)
    // [Línea 31] Aplica el filtro WHERE a la consulta SQL: .where(filtro)
    .where(filtro)
    // [Línea 32] Ordena las filas del resultado SQL: .orderBy(asc(usuarios.nombre))
    .orderBy(asc(usuarios.nombre))
    // [Línea 33] Limita la cantidad de filas por página: .limit(tamanoPagina)
    .limit(tamanoPagina)
    // [Línea 34] Desplaza el inicio de lectura según el número de página: .offset(salto);
    .offset(salto);
  // [Línea 35] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ total }]'.
  const [{ total }] = await db.select({ total: count() }).from(usuarios).where(filtro);

  // [Línea 37] Declara 'datos' y le asigna el valor resultante.
  const datos = filas.map((fila) => ({ ...aUsuarioPublico(fila), activo: fila.activo }));
  // [Línea 38] Devuelve el valor: respuestaPaginada(datos, pagina, tamanoPagina, total);
  return respuestaPaginada(datos, pagina, tamanoPagina, total);
// [Línea 39] Cierra el bloque o estructura (}).
}

// RF-U4: alta de usuario con contraseña temporal.
// [Línea 42] Declara la función asíncrona 'crearUsuario'.
export async function crearUsuario(usuario: UsuarioSesion, datosSinValidar: unknown) {
  // [Línea 43] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 44] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaUsuarioNuevo, datosSinValidar);
  // [Línea 45] Declara 'emailNuevo' y le asigna el valor resultante.
  const emailNuevo = datos.email.toLowerCase();

  // [Línea 47] Espera a que se complete la operación asíncrona: await verificarEmailLibre(emailNuevo);
  await verificarEmailLibre(emailNuevo);

  // [Línea 49] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'hashContrasena'.
  const hashContrasena = await bcrypt.hash(datos.password, 10);
  // [Línea 50] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[usuarioCreado]'.
  const [usuarioCreado] = await db
    // [Línea 51] Inserta una nueva fila en la tabla indicada de la base de datos.
    .insert(usuarios)
    // [Línea 52] Define los valores de las columnas a insertar.
    .values({ nombre: datos.nombre, email: emailNuevo, rol: datos.rol, hashContrasena, activo: true })
    // [Línea 53] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning();
  // [Línea 54] Devuelve el valor: { ...aUsuarioPublico(usuarioCreado), activo: usuarioCreado.activo };
  return { ...aUsuarioPublico(usuarioCreado), activo: usuarioCreado.activo };
// [Línea 55] Cierra el bloque o estructura (}).
}

// RF-U4: edición, cambio de rol y desactivación.
// [Línea 58] Declara la función asíncrona 'editarUsuario'.
export async function editarUsuario(usuario: UsuarioSesion, idUsuario: number, datosSinValidar: unknown) {
  // [Línea 59] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 60] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaUsuarioEdicion, datosSinValidar);

  // [Línea 62] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuarioExistente'.
  const usuarioExistente = await db.select().from(usuarios).where(eq(usuarios.id, idUsuario)).get();
  // [Línea 63] Verifica la condición: if (!usuarioExistente) throw noEncontrado("El usuario");
  if (!usuarioExistente) throw noEncontrado("El usuario");

  // Un admin no puede desactivarse ni quitarse el rol a sí mismo (quedaría sin administrador).
  // [Línea 66] Declara 'esElMismo' y le asigna el valor resultante.
  const esElMismo = idUsuario === usuario.id;
  // [Línea 67] Verifica la condición: if (esElMismo && (datos.activo === false || (datos.rol !== undefined && datos.rol !== "admin"))) {
  if (esElMismo && (datos.activo === false || (datos.rol !== undefined && datos.rol !== "admin"))) {
    // [Línea 68] Corta la ejecución y lanza el error: throw new ApiError(422, "OPERACION_SOBRE_SI_MISMO", "No podés desactivarte ni quitarte el rol de administrador.");
    throw new ApiError(422, "OPERACION_SOBRE_SI_MISMO", "No podés desactivarte ni quitarte el rol de administrador.");
  // [Línea 69] Cierra el bloque o estructura (}).
  }

  // [Línea 71] Verifica la condición: if (datos.email) {
  if (datos.email) {
    // [Línea 72] Ejecuta o evalúa: datos.email = datos.email.toLowerCase();
    datos.email = datos.email.toLowerCase();
    // [Línea 73] Verifica la condición: if (datos.email !== usuarioExistente.email) await verificarEmailLibre(datos.email);
    if (datos.email !== usuarioExistente.email) await verificarEmailLibre(datos.email);
  // [Línea 74] Cierra el bloque o estructura (}).
  }

  // [Línea 76] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[usuarioEditado]'.
  const [usuarioEditado] = await db.update(usuarios).set(datos).where(eq(usuarios.id, idUsuario)).returning();
  // [Línea 77] Devuelve el valor: { ...aUsuarioPublico(usuarioEditado), activo: usuarioEditado.activo };
  return { ...aUsuarioPublico(usuarioEditado), activo: usuarioEditado.activo };
// [Línea 78] Cierra el bloque o estructura (}).
}

// RF-U5: el administrador restablece la contraseña. Se muestra una sola vez.
// [Línea 81] Declara la función asíncrona 'restablecerContrasena'.
export async function restablecerContrasena(usuario: UsuarioSesion, idUsuario: number) {
  // [Línea 82] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 83] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuarioExistente'.
  const usuarioExistente = await db.select().from(usuarios).where(eq(usuarios.id, idUsuario)).get();
  // [Línea 84] Verifica la condición: if (!usuarioExistente) throw noEncontrado("El usuario");
  if (!usuarioExistente) throw noEncontrado("El usuario");

  // [Línea 86] Declara 'passwordTemporal' y le asigna el valor resultante.
  const passwordTemporal = generarContrasenaTemporal();
  // [Línea 87] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'hashContrasena'.
  const hashContrasena = await bcrypt.hash(passwordTemporal, 10);
  // [Línea 88] Actualiza las columnas de la tabla que cumplan la condición WHERE.
  await db.update(usuarios).set({ hashContrasena }).where(eq(usuarios.id, idUsuario));
  // [Línea 89] Devuelve el valor: { passwordTemporal };
  return { passwordTemporal };
// [Línea 90] Cierra el bloque o estructura (}).
}

// ---------- Funciones internas ----------

// [Línea 94] Declara la función asíncrona 'verificarEmailLibre'.
async function verificarEmailLibre(email: string) {
  // [Línea 95] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'otroUsuario'.
  const otroUsuario = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).get();
  // [Línea 96] Verifica la condición: if (otroUsuario) {
  if (otroUsuario) {
    // [Línea 97] Corta la ejecución y lanza el error: throw new ApiError(409, "EMAIL_DUPLICADO", "Ya existe un usuario con ese email.", [
    throw new ApiError(409, "EMAIL_DUPLICADO", "Ya existe un usuario con ese email.", [
      // [Línea 98] Ejecuta o evalúa: { campo: "email", mensaje: "Ya existe un usuario con ese email." },
      { campo: "email", mensaje: "Ya existe un usuario con ese email." },
    // [Línea 99] Cierra el bloque o estructura (]);).
    ]);
  // [Línea 100] Cierra el bloque o estructura (}).
  }
// [Línea 101] Cierra el bloque o estructura (}).
}

// [Línea 103] Declara la función o componente 'generarContrasenaTemporal'.
function generarContrasenaTemporal(): string {
  // [Línea 104] Declara 'caracteres' y le asigna el valor resultante.
  const caracteres = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  // [Línea 105] Declara 'contrasena' y le asigna el valor resultante.
  let contrasena = "";
  // [Línea 106] Recorre cada elemento en un bucle: for (let i = 0; i < 10; i++) {
  for (let i = 0; i < 10; i++) {
    // [Línea 107] Ejecuta o evalúa: contrasena += caracteres[randomInt(caracteres.length)]; // randomInt es seguro (
    contrasena += caracteres[randomInt(caracteres.length)]; // randomInt es seguro (criptográfico)
  // [Línea 108] Cierra el bloque o estructura (}).
  }
  // [Línea 109] Devuelve el valor: contrasena;
  return contrasena;
// [Línea 110] Cierra el bloque o estructura (}).
}
