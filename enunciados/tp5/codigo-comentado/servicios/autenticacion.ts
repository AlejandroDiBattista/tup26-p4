// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: servicios/autenticacion.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Servicio de AUTENTICACIÓN: inicio de sesión, usuario de la sesión y cambio de contraseña.
// RF-U1, RF-U2, RF-U5.
import bcrypt from "bcryptjs";
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
import { eq } from "drizzle-orm";
// Acá importamos la conexión y definición de tablas de la base de datos
import { db } from "@/basedatos/conexion";
// Acá importamos la conexión y definición de tablas de la base de datos
import { usuarios, type Usuario } from "@/basedatos/esquema";
// Acá importamos esquemas de validación
import { esquemaCambioContrasena, esquemaLogin } from "@/esquemas/usuarios";
import { ApiError } from "./errores";
import { validar, type UsuarioSesion } from "./comunes";

// Convierte una fila de la tabla en el usuario público (¡sin el hash de la contraseña!).
// Componente o función exportada 'aUsuarioPublico'
export function aUsuarioPublico(fila: Usuario): UsuarioSesion {
  return { id: fila.id, nombre: fila.nombre, email: fila.email, rol: fila.rol };
}

// RF-U1: inicio de sesión con email y contraseña.
// Si el email no existe, la contraseña no coincide o el usuario está inactivo,
// el mensaje es EL MISMO en los tres casos (así no se revela qué emails existen).
export async function iniciarSesion(datosSinValidar: unknown): Promise<UsuarioSesion> {
  const datos = validar(esquemaLogin, datosSinValidar);
  const emailBuscado = datos.email.toLowerCase();

  const usuarioEncontrado = await db.select().from(usuarios).where(eq(usuarios.email, emailBuscado)).get();

  const contrasenaCorrecta =
    usuarioEncontrado !== undefined && (await bcrypt.compare(datos.password, usuarioEncontrado.hashContrasena));

  // Comprobamos si el registro solicitado existe en el sistema
  if (!usuarioEncontrado || !contrasenaCorrecta || !usuarioEncontrado.activo) {
    // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
    throw new ApiError(401, "CREDENCIALES_INVALIDAS", "El email o la contraseña son incorrectos.");
  }
  return aUsuarioPublico(usuarioEncontrado);
}

// RF-U2 / sección 10.5: el usuario se busca en la base EN CADA PEDIDO.
// Si fue desactivado, devuelve null y pierde el acceso aunque conserve la cookie.
export async function buscarUsuarioDeSesion(idUsuario: number): Promise<UsuarioSesion | null> {
  const usuarioEncontrado = await db.select().from(usuarios).where(eq(usuarios.id, idUsuario)).get();
  // Comprobamos si el registro solicitado existe en el sistema
  if (!usuarioEncontrado || !usuarioEncontrado.activo) return null;
  return aUsuarioPublico(usuarioEncontrado);
}

// RF-U5: cada usuario puede cambiar su propia contraseña.
export async function cambiarContrasena(usuario: UsuarioSesion, datosSinValidar: unknown) {
  const datos = validar(esquemaCambioContrasena, datosSinValidar);

  const filaUsuario = await db.select().from(usuarios).where(eq(usuarios.id, usuario.id)).get();
  const actualCorrecta = filaUsuario && (await bcrypt.compare(datos.actual, filaUsuario.hashContrasena));
  if (!actualCorrecta) {
    // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
    throw new ApiError(422, "CONTRASENA_ACTUAL_INCORRECTA", "La contraseña actual no es correcta.", [
      { campo: "actual", mensaje: "La contraseña actual no es correcta." },
    ]);
  }

  // Las contraseñas se guardan con hash (bcrypt), nunca en texto plano.
  const hashNuevo = await bcrypt.hash(datos.nueva, 10);
  // Actualizamos los datos del registro en la base de datos
  await db.update(usuarios).set({ hashContrasena: hashNuevo }).where(eq(usuarios.id, usuario.id));
}
