// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de AUTENTICACIÓN: inicio de sesión, usuario de la sesión y cambio de contraseña.
// RF-U1, RF-U2, RF-U5.
// [Línea 3] Importa elementos desde 'bcryptjs'.
import bcrypt from "bcryptjs";
// [Línea 4] Importa elementos desde 'drizzle-orm'.
import { eq } from "drizzle-orm";
// [Línea 5] Importa elementos desde '@/basedatos/conexion'.
import { db } from "@/basedatos/conexion";
// [Línea 6] Importa elementos desde '@/basedatos/esquema'.
import { usuarios, type Usuario } from "@/basedatos/esquema";
// [Línea 7] Importa elementos desde '@/esquemas/usuarios'.
import { esquemaCambioContrasena, esquemaLogin } from "@/esquemas/usuarios";
// [Línea 8] Importa elementos desde './errores'.
import { ApiError } from "./errores";
// [Línea 9] Importa elementos desde './comunes'.
import { validar, type UsuarioSesion } from "./comunes";

// Convierte una fila de la tabla en el usuario público (¡sin el hash de la contraseña!).
// [Línea 12] Declara la función o componente 'aUsuarioPublico'.
export function aUsuarioPublico(fila: Usuario): UsuarioSesion {
  // [Línea 13] Devuelve el valor: { id: fila.id, nombre: fila.nombre, email: fila.email, rol: fila.rol };
  return { id: fila.id, nombre: fila.nombre, email: fila.email, rol: fila.rol };
// [Línea 14] Cierra el bloque o estructura (}).
}

// RF-U1: inicio de sesión con email y contraseña.
// Si el email no existe, la contraseña no coincide o el usuario está inactivo,
// el mensaje es EL MISMO en los tres casos (así no se revela qué emails existen).
// [Línea 19] Declara la función asíncrona 'iniciarSesion'.
export async function iniciarSesion(datosSinValidar: unknown): Promise<UsuarioSesion> {
  // [Línea 20] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaLogin, datosSinValidar);
  // [Línea 21] Declara 'emailBuscado' y le asigna el valor resultante.
  const emailBuscado = datos.email.toLowerCase();

  // [Línea 23] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuarioEncontrado'.
  const usuarioEncontrado = await db.select().from(usuarios).where(eq(usuarios.email, emailBuscado)).get();

  // [Línea 25] Declara 'contrasenaCorrecta' y le asigna el valor resultante.
  const contrasenaCorrecta =
    // [Línea 26] Ejecuta o evalúa: usuarioEncontrado !== undefined && (await bcrypt.compare(datos.password, usuario
    usuarioEncontrado !== undefined && (await bcrypt.compare(datos.password, usuarioEncontrado.hashContrasena));

  // [Línea 28] Verifica la condición: if (!usuarioEncontrado || !contrasenaCorrecta || !usuarioEncontrado.activo) {
  if (!usuarioEncontrado || !contrasenaCorrecta || !usuarioEncontrado.activo) {
    // [Línea 29] Corta la ejecución y lanza el error: throw new ApiError(401, "CREDENCIALES_INVALIDAS", "El email o la contraseña son incorrectos.");
    throw new ApiError(401, "CREDENCIALES_INVALIDAS", "El email o la contraseña son incorrectos.");
  // [Línea 30] Cierra el bloque o estructura (}).
  }
  // [Línea 31] Devuelve el valor: aUsuarioPublico(usuarioEncontrado);
  return aUsuarioPublico(usuarioEncontrado);
// [Línea 32] Cierra el bloque o estructura (}).
}

// RF-U2 / sección 10.5: el usuario se busca en la base EN CADA PEDIDO.
// Si fue desactivado, devuelve null y pierde el acceso aunque conserve la cookie.
// [Línea 36] Declara la función asíncrona 'buscarUsuarioDeSesion'.
export async function buscarUsuarioDeSesion(idUsuario: number): Promise<UsuarioSesion | null> {
  // [Línea 37] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuarioEncontrado'.
  const usuarioEncontrado = await db.select().from(usuarios).where(eq(usuarios.id, idUsuario)).get();
  // [Línea 38] Verifica la condición: if (!usuarioEncontrado || !usuarioEncontrado.activo) return null;
  if (!usuarioEncontrado || !usuarioEncontrado.activo) return null;
  // [Línea 39] Devuelve el valor: aUsuarioPublico(usuarioEncontrado);
  return aUsuarioPublico(usuarioEncontrado);
// [Línea 40] Cierra el bloque o estructura (}).
}

// RF-U5: cada usuario puede cambiar su propia contraseña.
// [Línea 43] Declara la función asíncrona 'cambiarContrasena'.
export async function cambiarContrasena(usuario: UsuarioSesion, datosSinValidar: unknown) {
  // [Línea 44] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaCambioContrasena, datosSinValidar);

  // [Línea 46] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filaUsuario'.
  const filaUsuario = await db.select().from(usuarios).where(eq(usuarios.id, usuario.id)).get();
  // [Línea 47] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'actualCorrecta'.
  const actualCorrecta = filaUsuario && (await bcrypt.compare(datos.actual, filaUsuario.hashContrasena));
  // [Línea 48] Verifica la condición: if (!actualCorrecta) {
  if (!actualCorrecta) {
    // [Línea 49] Corta la ejecución y lanza el error: throw new ApiError(422, "CONTRASENA_ACTUAL_INCORRECTA", "La contraseña actual no es correcta.", [
    throw new ApiError(422, "CONTRASENA_ACTUAL_INCORRECTA", "La contraseña actual no es correcta.", [
      // [Línea 50] Ejecuta o evalúa: { campo: "actual", mensaje: "La contraseña actual no es correcta." },
      { campo: "actual", mensaje: "La contraseña actual no es correcta." },
    // [Línea 51] Cierra el bloque o estructura (]);).
    ]);
  // [Línea 52] Cierra el bloque o estructura (}).
  }

  // Las contraseñas se guardan con hash (bcrypt), nunca en texto plano.
  // [Línea 55] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'hashNuevo'.
  const hashNuevo = await bcrypt.hash(datos.nueva, 10);
  // [Línea 56] Actualiza las columnas de la tabla que cumplan la condición WHERE.
  await db.update(usuarios).set({ hashContrasena: hashNuevo }).where(eq(usuarios.id, usuario.id));
// [Línea 57] Cierra el bloque o estructura (}).
}
