// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Esquemas de validación de categorías, productos y movimientos de stock.
// [Línea 2] Importa elementos desde 'zod'.
import { z } from "zod";

// ---------- Categorías ----------
// [Línea 5] Define y exporta el esquema de validación Zod 'esquemaCategoriaNueva' (compartido entre cliente y servidor).
export const esquemaCategoriaNueva = z.strictObject({
  // [Línea 6] Define o asigna el campo/parámetro 'nombre'.
  nombre: z.string().trim().min(1, "Es obligatorio.").max(40, "Máximo 40 caracteres."),
// [Línea 7] Cierra el bloque o estructura (});).
});

// [Línea 9] Define y exporta el esquema de validación Zod 'esquemaCategoriaEdicion' (compartido entre cliente y servidor).
export const esquemaCategoriaEdicion = z.strictObject({
  // [Línea 10] Define o asigna el campo/parámetro 'nombre'.
  nombre: z.string().trim().min(1, "Es obligatorio.").max(40, "Máximo 40 caracteres.").optional(),
  // [Línea 11] Define o asigna el campo/parámetro 'activa'.
  activa: z.boolean().optional(),
// [Línea 12] Cierra el bloque o estructura (});).
});

// ---------- Productos ----------
// "precio" llega en CENTAVOS (entero). El formulario convierte los pesos a centavos.
// [Línea 16] Define y exporta el esquema de validación Zod 'esquemaProductoNuevo' (compartido entre cliente y servidor).
export const esquemaProductoNuevo = z.strictObject({
  // [Línea 17] Define o asigna el campo/parámetro 'codigo'.
  codigo: z.string().trim().min(1, "Es obligatorio.").max(20, "Máximo 20 caracteres."),
  // [Línea 18] Define o asigna el campo/parámetro 'descripcion'.
  descripcion: z.string().trim().min(1, "Es obligatoria.").max(120, "Máximo 120 caracteres."),
  // [Línea 19] Define o asigna el campo/parámetro 'categoriaId'.
  categoriaId: z.coerce.number().int().positive("Elegí una categoría."),
  // [Línea 20] Define o asigna el campo/parámetro 'precio'.
  precio: z.coerce.number().int("El precio debe estar en centavos.").positive("El precio debe ser mayor que cero."),
  // [Línea 21] Define o asigna el campo/parámetro 'stockMinimo'.
  stockMinimo: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo."),
  // [Línea 22] Define o asigna el campo/parámetro 'stockInicial'.
  stockInicial: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo.").optional(),
// [Línea 23] Cierra el bloque o estructura (});).
});

// La edición NO acepta "existencia": al ser strict, si llega se responde 422.
// [Línea 26] Define y exporta el esquema de validación Zod 'esquemaProductoEdicion' (compartido entre cliente y servidor).
export const esquemaProductoEdicion = z.strictObject({
  // [Línea 27] Define o asigna el campo/parámetro 'codigo'.
  codigo: z.string().trim().min(1, "Es obligatorio.").max(20, "Máximo 20 caracteres.").optional(),
  // [Línea 28] Define o asigna el campo/parámetro 'descripcion'.
  descripcion: z.string().trim().min(1, "Es obligatoria.").max(120, "Máximo 120 caracteres.").optional(),
  // [Línea 29] Define o asigna el campo/parámetro 'categoriaId'.
  categoriaId: z.coerce.number().int().positive("Elegí una categoría.").optional(),
  // [Línea 30] Define o asigna el campo/parámetro 'precio'.
  precio: z.coerce.number().int("El precio debe estar en centavos.").positive("El precio debe ser mayor que cero.").optional(),
  // [Línea 31] Define o asigna el campo/parámetro 'stockMinimo'.
  stockMinimo: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo.").optional(),
  // [Línea 32] Define o asigna el campo/parámetro 'activo'.
  activo: z.boolean().optional(),
// [Línea 33] Cierra el bloque o estructura (});).
});

// ---------- Movimientos manuales de stock ----------
// [Línea 36] Declara y exporta la constante 'MOTIVOS_INGRESO'.
export const MOTIVOS_INGRESO = ["Reposición", "Stock inicial", "Devolución de cliente"] as const;
// [Línea 37] Declara y exporta la constante 'MOTIVOS_EGRESO'.
export const MOTIVOS_EGRESO = ["Rotura", "Vencimiento", "Ajuste de inventario", "Uso interno"] as const;

// [Línea 39] Declara y exporta la constante 'esquemaMovimientoStock'.
export const esquemaMovimientoStock = z
  // [Línea 40] Ejecuta o evalúa: .strictObject({
  .strictObject({
    // [Línea 41] Define o asigna el campo/parámetro 'tipo'.
    tipo: z.enum(["ingreso", "egreso"], "Elegí ingreso o egreso."),
    // [Línea 42] Define o asigna el campo/parámetro 'cantidad'.
    cantidad: z.coerce.number().int("Debe ser un número entero.").positive("La cantidad debe ser mayor que cero."),
    // [Línea 43] Define o asigna el campo/parámetro 'motivo'.
    motivo: z.string().trim().min(1, "El motivo es obligatorio."),
    // [Línea 44] Define o asigna el campo/parámetro 'observacion'.
    observacion: z.string().trim().max(200).optional(),
  // [Línea 45] Cierra el bloque o estructura (})).
  })
  // [Línea 46] Ejecuta o evalúa: .refine(
  .refine(
    // [Línea 47] Ejecuta o evalúa: (datos) => {
    (datos) => {
      // [Línea 48] Declara 'motivosValidos: readonly string[]' y le asigna el valor resultante.
      const motivosValidos: readonly string[] = datos.tipo === "ingreso" ? MOTIVOS_INGRESO : MOTIVOS_EGRESO;
      // [Línea 49] Devuelve el valor: motivosValidos.includes(datos.motivo);
      return motivosValidos.includes(datos.motivo);
    // [Línea 50] Cierra el bloque o estructura (},).
    },
    // [Línea 51] Ejecuta o evalúa: { message: "El motivo no corresponde al tipo de movimiento.", path: ["motivo"] }
    { message: "El motivo no corresponde al tipo de movimiento.", path: ["motivo"] },
  // [Línea 52] Cierra el bloque o estructura ();).
  );
