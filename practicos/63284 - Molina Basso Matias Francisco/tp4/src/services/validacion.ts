import { z } from "zod";
import type { NuevoCliente, NuevaActividad } from "../db/schema.js";

const texto = z
  .string()
  .normalize()
  .trim()
  .transform((valor) => valor.replace(/\s+/g, " "))
  .pipe(z.string().max(300));
const nombre = texto
  .pipe(z.string().min(1))
  .transform((valor) =>
    valor
      .toLocaleLowerCase("es-AR")
      .replace(
        /\p{L}[\p{L}\p{M}]*/gu,
        (palabra) => palabra[0].toLocaleUpperCase("es-AR") + palabra.slice(1),
      ),
  );
const opcional = texto
  .nullable()
  .default(null)
  .transform((valor) => valor || null);
const telefono = z
  .string()
  .trim()
  .regex(
    /^[+\d\s().-]*$/,
    "El teléfono solo admite números, un + inicial y separadores.",
  )
  .transform((valor) => valor.replace(/[\s().-]/g, ""))
  .pipe(
    z.union([
      z.literal(""),
      z
        .string()
        .regex(/^\+?\d{6,15}$/, "El teléfono debe tener entre 6 y 15 dígitos."),
    ]),
  )
  .nullable()
  .default(null)
  .transform((valor) => valor || null);

export const clienteSchema = z
  .object({
    nombre,
    apellido: nombre,
    email: z.string().trim().toLowerCase().pipe(z.email()),
    domicilio: opcional,
    localidad: opcional,
    telefono,
  })
  .strict();

export const actividadSchema = z
  .object({
    descripcion: z.string().trim().min(1).max(2000),
    fechaCompromiso: z.iso.date().nullable().default(null),
  })
  .strict();

export function normalizarCliente(datos: unknown): Omit<NuevoCliente, "id"> {
  return clienteSchema.parse(datos);
}

export function validarActividad(
  datos: unknown,
): Pick<NuevaActividad, "descripcion" | "fechaCompromiso"> {
  return actividadSchema.parse(datos);
}

export function textoBusqueda(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es-AR")
    .trim()
    .replace(/\s+/g, " ");
}
