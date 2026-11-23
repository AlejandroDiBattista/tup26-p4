/* ==========================================================================
   ESQUEMAS DE VALIDACIÓN ZOD PARA USUARIOS Y AUTENTICACIÓN (ESQUEMAS/USUARIOS.TS)
   Este módulo valida las credenciales de inicio de sesión, cambios de contraseña
   y la administración de empleados (alta y edición de usuarios).
   ========================================================================== */

/* importamos la biblioteca Zod */
import { z } from "zod";

/* tupla inmutable con los únicos dos roles admitidos por el sistema */
export const ROLES = ["admin", "vendedor"] as const;

/* ==========================================================================
   ESQUEMA: esquemaLogin (POST /api/auth/login)
   Valida el formulario de acceso: exige email y contraseña no vacíos.
   ========================================================================== */
export const esquemaLogin = z.strictObject({
  email: z.string().trim().min(1, "Ingresá tu email."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

/* ==========================================================================
   ESQUEMA: esquemaCambioContrasena (PUT /api/auth/password)
   Valida el cambio voluntario de clave de cada usuario:
   - actual: obligatoria para reconfirmar identidad
   - nueva: longitud mínima obligatoria de 8 caracteres
   ========================================================================== */
export const esquemaCambioContrasena = z.strictObject({
  actual: z.string().min(1, "Ingresá tu contraseña actual."),
  nueva: z.string().min(8, "La contraseña nueva debe tener al menos 8 caracteres."),
});

/* ==========================================================================
   ESQUEMA: esquemaUsuarioNuevo (POST /api/usuarios)
   Valida el alta de un nuevo empleado:
   - nombre: obligatorio
   - email: formato válido de correo electrónico
   - rol: 'admin' o 'vendedor'
   - password: clave provisoria temporal de al menos 8 caracteres
   ========================================================================== */
export const esquemaUsuarioNuevo = z.strictObject({
  nombre: z.string().trim().min(1, "Es obligatorio."),
  email: z.email("El email no es válido."),
  rol: z.enum(ROLES, "Elegí un rol."),
  password: z.string().min(8, "La contraseña temporal debe tener al menos 8 caracteres."),
});

/* ==========================================================================
   ESQUEMA: esquemaUsuarioEdicion (PATCH /api/usuarios/{id})
   Permite actualizar nombre, email, rol o estado activo del usuario.
   Usa strictObject para evitar inyección de campos no autorizados.
   ========================================================================== */
export const esquemaUsuarioEdicion = z.strictObject({
  nombre: z.string().trim().min(1, "Es obligatorio.").optional(),
  email: z.email("El email no es válido.").optional(),
  rol: z.enum(ROLES, "Elegí un rol.").optional(),
  activo: z.boolean().optional(),
});

/* inferimos el tipo TypeScript de los datos para crear un usuario */
export type DatosUsuarioNuevo = z.infer<typeof esquemaUsuarioNuevo>;
