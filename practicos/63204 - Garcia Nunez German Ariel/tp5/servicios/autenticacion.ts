/* ==========================================================================
   SERVICIO DE AUTENTICACIÓN Y SEGURIDAD
   Cumple con los requisitos funcionales RF-U1, RF-U2 y RF-U5 del sistema:
   
   - RF-U1: Inicio de sesión seguro con email y contraseña.
   - RF-U2: Verificación de sesión activa consultando la base de datos en cada petición.
   - RF-U5: Cambio de contraseña personal de cada usuario.
   
   REGLAS DE SEGURIDAD ESTRICTAS:
   1. Las contraseñas NUNCA se guardan en texto plano; siempre se almacenan hasheadas con bcryptjs (coste 10).
   2. Prevención de enumeración de usuarios: Si el email no existe, la contraseña es incorrecta
      o el usuario está dado de baja, se devuelve exactamente el mismo mensaje de error genérico 401
      para no revelar a un atacante si un email existe o no en el sistema.
   3. Segunda barrera de seguridad: En cada petición HTTP se valida que el usuario siga existiendo
      y esté activo (activo = true) en la base de datos, revocando el acceso inmediato si fue despedido.
   ========================================================================== */

/* los import traen herramientas de seguridad y base de datos:
   - bcrypt: biblioteca para comparar y generar hashes criptográficos seguros de contraseñas
   - eq: operador de igualdad de Drizzle ORM
   - db: instancia de conexión a SQLite / libSQL
   - usuarios, Usuario: tabla de usuarios y su tipo de TypeScript correspondiente
   - esquemas Zod: validadores para inicio de sesión y cambio de contraseña
   - ApiError: clase de error con código HTTP
   - validar y UsuarioSesion: helpers comunes para esquemas y tipo de datos de sesión */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/basedatos/conexion";
import { usuarios, type Usuario } from "@/basedatos/esquema";
import { esquemaCambioContrasena, esquemaLogin } from "@/esquemas/usuarios";
import { ApiError } from "./errores";
import { validar, type UsuarioSesion } from "./comunes";

/* ==========================================================================
   FUNCIÓN: aUsuarioPublico
   ¿Para qué sirve? Toma una fila completa de la tabla usuarios y devuelve únicamente
   los datos seguros (id, nombre, email, rol), OMITIENDO de forma obligatoria el hash
   de la contraseña para que jamás viaje al cliente ni se exponga en respuestas JSON.
   ========================================================================== */
export function aUsuarioPublico(fila: Usuario): UsuarioSesion {
  return { id: fila.id, nombre: fila.nombre, email: fila.email, rol: fila.rol };
}

/* ==========================================================================
   RF-U1: INICIAR SESIÓN (LOGIN)
   ¿Para qué sirve? Valida las credenciales ingresadas por el usuario en el formulario.
   ¿Cómo funciona?
   1. Valida el formato del email y password con Zod.
   2. Pasa el email a minúsculas para evitar problemas de mayúsculas/minúsculas.
   3. Busca el usuario en la base de datos.
   4. Compara la contraseña en texto plano contra el hash guardado usando bcrypt.compare().
   5. Si algo falla o el usuario está inactivo, lanza error 401 genérico.
   ========================================================================== */
export async function iniciarSesion(datosSinValidar: unknown): Promise<UsuarioSesion> {
  /* validamos con Zod que el email sea válido y la contraseña no esté vacía */
  const datos = validar(esquemaLogin, datosSinValidar);

  /* normalizamos el email a minúsculas */
  const emailBuscado = datos.email.toLowerCase();

  /* buscamos el usuario por su email en la tabla usuarios */
  const usuarioEncontrado = await db.select().from(usuarios).where(eq(usuarios.email, emailBuscado)).get();

  /* comparamos de forma asíncrona la contraseña enviada con el hash bcrypt guardado en la base de datos */
  const contrasenaCorrecta =
    usuarioEncontrado !== undefined && (await bcrypt.compare(datos.password, usuarioEncontrado.hashContrasena));

  /* REGLA ANTI-ENUMERACIÓN DE USUARIOS:
     Si el email no existe (!usuarioEncontrado), si la contraseña es errónea (!contrasenaCorrecta)
     o si el empleado fue dado de baja (!usuarioEncontrado.activo),
     arrojamos exactamente el mismo error 401 con el mensaje "El email o la contraseña son incorrectos" */
  if (!usuarioEncontrado || !contrasenaCorrecta || !usuarioEncontrado.activo) {
    throw new ApiError(401, "CREDENCIALES_INVALIDAS", "El email o la contraseña son incorrectos.");
  }

  /* si todo es correcto, devolvemos los datos del usuario en sesión */
  return aUsuarioPublico(usuarioEncontrado);
}

/* ==========================================================================
   RF-U2: BUSCAR USUARIO DE SESIÓN (VALIDACIÓN EN CADA PETICIÓN)
   ¿Para qué sirve? Se ejecuta en cada navegación o llamada de API para verificar
   que el usuario del token JWT siga siendo válido y no haya sido desactivado por el administrador.
   Si el usuario fue dado de baja (activo = false), devuelve null y pierde el acceso al instante.
   ========================================================================== */
export async function buscarUsuarioDeSesion(idUsuario: number): Promise<UsuarioSesion | null> {
  /* buscamos al usuario por su id en la base de datos */
  const usuarioEncontrado = await db.select().from(usuarios).where(eq(usuarios.id, idUsuario)).get();
  
  /* si no existe o fue desactivado, devolvemos null para forzar el cierre de sesión */
  if (!usuarioEncontrado || !usuarioEncontrado.activo) return null;
  
  /* devolvemos los datos públicos del usuario */
  return aUsuarioPublico(usuarioEncontrado);
}

/* ==========================================================================
   RF-U5: CAMBIAR CONTRASEÑA PERSONAL
   ¿Para qué sirve? Permite al usuario en sesión actualizar su propia clave.
   ¿Cómo funciona? Exige ingresar la clave actual para revalidar identidad,
   comprueba que sea correcta, genera un nuevo hash con bcrypt y actualiza la fila.
   ========================================================================== */
export async function cambiarContrasena(usuario: UsuarioSesion, datosSinValidar: unknown) {
  /* validamos con Zod que la nueva contraseña cumpla con los requisitos mínimos de seguridad */
  const datos = validar(esquemaCambioContrasena, datosSinValidar);

  /* buscamos el usuario en la base de datos */
  const filaUsuario = await db.select().from(usuarios).where(eq(usuarios.id, usuario.id)).get();
  
  /* verificamos que la contraseña actual ingresada coincida con el hash actual */
  const actualCorrecta = filaUsuario && (await bcrypt.compare(datos.actual, filaUsuario.hashContrasena));
  
  /* si la contraseña actual no coincide, arrojamos error 422 de validación */
  if (!actualCorrecta) {
    throw new ApiError(422, "CONTRASENA_ACTUAL_INCORRECTA", "La contraseña actual no es correcta.", [
      { campo: "actual", mensaje: "La contraseña actual no es correcta." },
    ]);
  }

  /* generamos el nuevo hash criptográfico con bcrypt usando un factor de costo 10 */
  const hashNuevo = await bcrypt.hash(datos.nueva, 10);

  /* guardamos el nuevo hash en la base de datos */
  await db.update(usuarios).set({ hashContrasena: hashNuevo }).where(eq(usuarios.id, usuario.id));
}
