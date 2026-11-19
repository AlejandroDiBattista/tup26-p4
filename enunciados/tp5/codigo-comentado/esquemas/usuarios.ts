// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Esquemas de validación de usuarios y sesión.
// Se usan en el SERVIDOR (servicios) y en los FORMULARIOS (para adelantar los mismos mensajes).
// [Línea 3] Importa elementos desde 'zod'.
import { z } from "zod";

// [Línea 5] Declara y exporta la constante 'ROLES'.
export const ROLES = ["admin", "vendedor"] as const;

// POST /api/auth/login
// [Línea 8] Define y exporta el esquema de validación Zod 'esquemaLogin' (compartido entre cliente y servidor).
export const esquemaLogin = z.strictObject({
  // [Línea 9] Define o asigna el campo/parámetro 'email'.
  email: z.string().trim().min(1, "Ingresá tu email."),
  // [Línea 10] Define o asigna el campo/parámetro 'password'.
  password: z.string().min(1, "Ingresá tu contraseña."),
// [Línea 11] Cierra el bloque o estructura (});).
});

// PUT /api/auth/password
// [Línea 14] Define y exporta el esquema de validación Zod 'esquemaCambioContrasena' (compartido entre cliente y servidor).
export const esquemaCambioContrasena = z.strictObject({
  // [Línea 15] Define o asigna el campo/parámetro 'actual'.
  actual: z.string().min(1, "Ingresá tu contraseña actual."),
  // [Línea 16] Define o asigna el campo/parámetro 'nueva'.
  nueva: z.string().min(8, "La contraseña nueva debe tener al menos 8 caracteres."),
// [Línea 17] Cierra el bloque o estructura (});).
});

// POST /api/usuarios
// [Línea 20] Define y exporta el esquema de validación Zod 'esquemaUsuarioNuevo' (compartido entre cliente y servidor).
export const esquemaUsuarioNuevo = z.strictObject({
  // [Línea 21] Define o asigna el campo/parámetro 'nombre'.
  nombre: z.string().trim().min(1, "Es obligatorio."),
  // [Línea 22] Define o asigna el campo/parámetro 'email'.
  email: z.email("El email no es válido."),
  // [Línea 23] Define o asigna el campo/parámetro 'rol'.
  rol: z.enum(ROLES, "Elegí un rol."),
  // [Línea 24] Define o asigna el campo/parámetro 'password'.
  password: z.string().min(8, "La contraseña temporal debe tener al menos 8 caracteres."),
// [Línea 25] Cierra el bloque o estructura (});).
});

// PATCH /api/usuarios/{id}  (strict: rechaza campos no previstos)
// [Línea 28] Define y exporta el esquema de validación Zod 'esquemaUsuarioEdicion' (compartido entre cliente y servidor).
export const esquemaUsuarioEdicion = z.strictObject({
  // [Línea 29] Define o asigna el campo/parámetro 'nombre'.
  nombre: z.string().trim().min(1, "Es obligatorio.").optional(),
  // [Línea 30] Define o asigna el campo/parámetro 'email'.
  email: z.email("El email no es válido.").optional(),
  // [Línea 31] Define o asigna el campo/parámetro 'rol'.
  rol: z.enum(ROLES, "Elegí un rol.").optional(),
  // [Línea 32] Define o asigna el campo/parámetro 'activo'.
  activo: z.boolean().optional(),
// [Línea 33] Cierra el bloque o estructura (});).
});

// [Línea 35] Define el tipo de datos 'DatosUsuarioNuevo' en TypeScript.
export type DatosUsuarioNuevo = z.infer<typeof esquemaUsuarioNuevo>;
