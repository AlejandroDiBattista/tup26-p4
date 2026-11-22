// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: esquemas/productos.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Esquemas de validación de categorías, productos y movimientos de stock.
// Acá importamos Zod para crear esquemas de validación de datos en formularios y APIs
import { z } from "zod";

// ---------- Categorías ----------
export const esquemaCategoriaNueva = z.strictObject({
  nombre: z.string().trim().min(1, "Es obligatorio.").max(40, "Máximo 40 caracteres."),
});

export const esquemaCategoriaEdicion = z.strictObject({
  nombre: z.string().trim().min(1, "Es obligatorio.").max(40, "Máximo 40 caracteres.").optional(),
  activa: z.boolean().optional(),
});

// ---------- Productos ----------
// "precio" llega en CENTAVOS (entero). El formulario convierte los pesos a centavos.
export const esquemaProductoNuevo = z.strictObject({
  codigo: z.string().trim().min(1, "Es obligatorio.").max(20, "Máximo 20 caracteres."),
  descripcion: z.string().trim().min(1, "Es obligatoria.").max(120, "Máximo 120 caracteres."),
  categoriaId: z.coerce.number().int().positive("Elegí una categoría."),
  precio: z.coerce.number().int("El precio debe estar en centavos.").positive("El precio debe ser mayor que cero."),
  stockMinimo: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo."),
  stockInicial: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo.").optional(),
});

// La edición NO acepta "existencia": al ser strict, si llega se responde 422.
export const esquemaProductoEdicion = z.strictObject({
  codigo: z.string().trim().min(1, "Es obligatorio.").max(20, "Máximo 20 caracteres.").optional(),
  descripcion: z.string().trim().min(1, "Es obligatoria.").max(120, "Máximo 120 caracteres.").optional(),
  categoriaId: z.coerce.number().int().positive("Elegí una categoría.").optional(),
  precio: z.coerce.number().int("El precio debe estar en centavos.").positive("El precio debe ser mayor que cero.").optional(),
  stockMinimo: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo.").optional(),
  activo: z.boolean().optional(),
});

// ---------- Movimientos manuales de stock ----------
export const MOTIVOS_INGRESO = ["Reposición", "Stock inicial", "Devolución de cliente"] as const;
export const MOTIVOS_EGRESO = ["Rotura", "Vencimiento", "Ajuste de inventario", "Uso interno"] as const;

export const esquemaMovimientoStock = z
  .strictObject({
    tipo: z.enum(["ingreso", "egreso"], "Elegí ingreso o egreso."),
    cantidad: z.coerce.number().int("Debe ser un número entero.").positive("La cantidad debe ser mayor que cero."),
    motivo: z.string().trim().min(1, "El motivo es obligatorio."),
    observacion: z.string().trim().max(200).optional(),
  })
  .refine(
    (datos) => {
      const motivosValidos: readonly string[] = datos.tipo === "ingreso" ? MOTIVOS_INGRESO : MOTIVOS_EGRESO;
      return motivosValidos.includes(datos.motivo);
    },
    { message: "El motivo no corresponde al tipo de movimiento.", path: ["motivo"] },
  );
