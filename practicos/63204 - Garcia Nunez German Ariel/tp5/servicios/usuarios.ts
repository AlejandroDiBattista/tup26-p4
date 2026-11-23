/* ==========================================================================
   SERVICIO DE GESTIÓN DE USUARIOS
   Cumple con los requisitos funcionales RF-U3, RF-U4 y RF-U5 del sistema:
   
   - RF-U3 / RF-U4: Listado, creación, edición, cambio de roles y desactivación (baja lógica).
   - RF-U5: Restablecimiento de contraseña generado por el administrador.
   
   REGLAS DE SEGURIDAD Y CONTROL:
   1. Todas las operaciones requieren rol de administrador (exigirAdmin).
   2. Protección contra bloqueo del sistema (Deadlock de Administración): Un administrador
      NUNCA puede desactivarse a sí mismo ni rebajarse su propio rol de administrador.
      Esto previene que el sistema se quede accidentalmente sin ningún administrador activo.
   3. Contraseñas temporales seguras generadas con criptografía nativa (node:crypto randomInt).
   ========================================================================== */

/* los import traen herramientas del ecosistema Node.js y Drizzle ORM:
   - bcrypt: para generar hashes de contraseñas con coste 10
   - randomInt: generador criptográfico de números aleatorios seguro del módulo node:crypto
   - and, count, eq, like, or, asc: operadores SQL de Drizzle
   - db: instancia de base de datos
   - usuarios: tabla de usuarios
   - esquemas Zod: validadores para creación y edición de usuarios
   - ApiError, noEncontrado: manejo de errores HTTP
   - exigirAdmin, leerPaginacion, respuestaPaginada, validar, UsuarioSesion: utilidades comunes
   - aUsuarioPublico: helper que omite el hash de la contraseña */
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { and, count, eq, like, or, asc } from "drizzle-orm";
import { db } from "@/basedatos/conexion";
import { usuarios } from "@/basedatos/esquema";
import { esquemaUsuarioEdicion, esquemaUsuarioNuevo } from "@/esquemas/usuarios";
import { ApiError, noEncontrado } from "./errores";
import { exigirAdmin, leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";
import { aUsuarioPublico } from "./autenticacion";

/* tipo de datos para los filtros de búsqueda en el listado de usuarios */
type ParametrosListado = { q?: string; activo?: string; page?: string; pageSize?: string };

/* ==========================================================================
   RF-U4: LISTAR USUARIOS (CON BÚSQUEDA Y PAGINACIÓN)
   ¿Para qué sirve? Muestra los empleados registrados en el sistema (administradores y vendedores).
   ¿Quién puede verlo? Exclusivo para administradores (exigirAdmin).
   ¿Seguridad? Nunca devuelve el hash de la contraseña.
   ========================================================================== */
export async function listarUsuarios(usuario: UsuarioSesion, parametros: ParametrosListado) {
  /* verificamos que el usuario en sesión sea administrador */
  exigirAdmin(usuario);

  /* leemos la página actual, el tamaño de página y el salto (offset) */
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  /* creamos las condiciones dinámicas para el WHERE */
  const condiciones = [];

  /* si se ingresó texto en 'q', busca coincidencias parciales por nombre o por email con LIKE */
  if (parametros.q) {
    const textoBuscado = `%${parametros.q}%`;
    condiciones.push(or(like(usuarios.nombre, textoBuscado), like(usuarios.email, textoBuscado)));
  }

  /* filtramos por estado activo (true/false) si viene especificado */
  if (parametros.activo === "true") condiciones.push(eq(usuarios.activo, true));
  if (parametros.activo === "false") condiciones.push(eq(usuarios.activo, false));

  /* unimos las condiciones con AND */
  const filtro = and(...condiciones);

  /* consultamos los usuarios ordenados alfabéticamente por nombre */
  const filas = await db
    .select()
    .from(usuarios)
    .where(filtro)
    .orderBy(asc(usuarios.nombre))
    .limit(tamanoPagina)
    .offset(salto);

  /* contamos el total de filas que cumplen el filtro para calcular las páginas */
  const [{ total }] = await db.select({ total: count() }).from(usuarios).where(filtro);

  /* usamos .map() para filtrar el hash de la contraseña de cada usuario con aUsuarioPublico */
  const datos = filas.map((fila) => ({ ...aUsuarioPublico(fila), activo: fila.activo }));

  /* devolvemos la respuesta estructurada paginada */
  return respuestaPaginada(datos, pagina, tamanoPagina, total);
}

/* ==========================================================================
   RF-U4: CREAR NUEVO USUARIO
   ¿Para qué sirve? Da de alta un nuevo empleado en la ferretería (vendedor o admin).
   ¿Cómo funciona? Valida con Zod, comprueba que el email esté libre, genera el hash
   de la contraseña con bcrypt y guarda la fila con activo = true.
   ========================================================================== */
export async function crearUsuario(usuario: UsuarioSesion, datosSinValidar: unknown) {
  /* solo administradores pueden crear usuarios */
  exigirAdmin(usuario);

  /* validamos los campos con Zod */
  const datos = validar(esquemaUsuarioNuevo, datosSinValidar);

  /* pasamos el email a minúsculas */
  const emailNuevo = datos.email.toLowerCase();

  /* comprobamos que no exista otro usuario con ese mismo email */
  await verificarEmailLibre(emailNuevo);

  /* generamos el hash de la contraseña usando bcrypt con coste 10 */
  const hashContrasena = await bcrypt.hash(datos.password, 10);

  /* insertamos el usuario en la base de datos */
  const [usuarioCreado] = await db
    .insert(usuarios)
    .values({ nombre: datos.nombre, email: emailNuevo, rol: datos.rol, hashContrasena, activo: true })
    .returning();

  /* devolvemos los datos del usuario omitiendo el hash */
  return { ...aUsuarioPublico(usuarioCreado), activo: usuarioCreado.activo };
}

/* ==========================================================================
   RF-U4: EDITAR USUARIO (ROL, NOMBRE, EMAIL O DESACTIVACIÓN)
   ¿Para qué sirve? Permite modificar los datos de un empleado o darlo de baja lógica.
   REGLA DE PROTECCIÓN:
   Un administrador no puede desactivarse a sí mismo ni rebajarse su propio rol de admin,
   porque dejaría al sistema huérfano sin nadie con permisos para reconfigurarlo.
   ========================================================================== */
export async function editarUsuario(usuario: UsuarioSesion, idUsuario: number, datosSinValidar: unknown) {
  /* solo administradores pueden editar */
  exigirAdmin(usuario);

  /* validamos los cambios recibidos con Zod */
  const datos = validar(esquemaUsuarioEdicion, datosSinValidar);

  /* buscamos el usuario que se desea modificar */
  const usuarioExistente = await db.select().from(usuarios).where(eq(usuarios.id, idUsuario)).get();
  if (!usuarioExistente) throw noEncontrado("El usuario");

  /* REGLA DE SEGURIDAD: comprobar si el administrador está operando sobre su propia cuenta */
  const esElMismo = idUsuario === usuario.id;
  if (esElMismo && (datos.activo === false || (datos.rol !== undefined && datos.rol !== "admin"))) {
    throw new ApiError(422, "OPERACION_SOBRE_SI_MISMO", "No podés desactivarte ni quitarte el rol de administrador.");
  }

  /* si se modificó el email, verificamos que no pertenezca a otro usuario */
  if (datos.email) {
    datos.email = datos.email.toLowerCase();
    if (datos.email !== usuarioExistente.email) await verificarEmailLibre(datos.email);
  }

  /* actualizamos la fila en la base de datos */
  const [usuarioEditado] = await db.update(usuarios).set(datos).where(eq(usuarios.id, idUsuario)).returning();

  /* devolvemos los datos del usuario modificado */
  return { ...aUsuarioPublico(usuarioEditado), activo: usuarioEditado.activo };
}

/* ==========================================================================
   RF-U5: RESTABLECER CONTRASEÑA DE UN USUARIO
   ¿Para qué sirve? Si un vendedor olvida su contraseña, el administrador le genera
   una clave provisoria temporal de 10 caracteres criptográficos para que pueda ingresar
   y luego cambiarla por su cuenta.
   ========================================================================== */
export async function restablecerContrasena(usuario: UsuarioSesion, idUsuario: number) {
  /* solo administradores pueden restablecer claves */
  exigirAdmin(usuario);

  /* verificamos que el usuario exista */
  const usuarioExistente = await db.select().from(usuarios).where(eq(usuarios.id, idUsuario)).get();
  if (!usuarioExistente) throw noEncontrado("El usuario");

  /* generamos una contraseña aleatoria criptográfica con randomInt */
  const passwordTemporal = generarContrasenaTemporal();

  /* generamos el nuevo hash con bcrypt */
  const hashContrasena = await bcrypt.hash(passwordTemporal, 10);

  /* actualizamos la contraseña en la base de datos */
  await db.update(usuarios).set({ hashContrasena }).where(eq(usuarios.id, idUsuario));

  /* devolvemos la contraseña en texto plano una sola vez para que el admin se la comunique al empleado */
  return { passwordTemporal };
}

/* ==========================================================================
   FUNCIONES INTERNAS AUXILIARES
   ========================================================================== */

/* verificarEmailLibre: asegura que no existan cuentas duplicadas con el mismo correo electrónico */
async function verificarEmailLibre(email: string) {
  const otroUsuario = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).get();
  if (otroUsuario) {
    throw new ApiError(409, "EMAIL_DUPLICADO", "Ya existe un usuario con ese email.", [
      { campo: "email", mensaje: "Ya existe un usuario con ese email." },
    ]);
  }
}

/* generarContrasenaTemporal: arma una cadena aleatoria de 10 caracteres
   omitiendo caracteres visualmente ambiguos (como la 'o' mayúscula, el número '0', la 'l' minúscula o el '1') */
function generarContrasenaTemporal(): string {
  const caracteres = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let contrasena = "";
  for (let i = 0; i < 10; i++) {
    /* usamos randomInt de node:crypto que garantiza entropía criptográfica real (no pseudoaleatoria como Math.random) */
    contrasena += caracteres[randomInt(caracteres.length)];
  }
  return contrasena;
}
