import { z } from 'zod';

export const id = z.number().int().positive().safe().describe('ID entero positivo.');
const texto = z.string();
export const fecha = texto.regex(/^\d{4}-\d{2}-\d{2}$/, 'Usá el formato AAAA-MM-DD.').describe('Fecha de calendario AAAA-MM-DD.');
const opcional = texto.nullable().optional();

export const cliente = z.object({
  nombre: texto.describe('Nombre del cliente.'),
  apellido: texto.describe('Apellido del cliente.'),
  email: texto.describe('Email único; el servicio lo normaliza.'),
  telefono: opcional,
  domicilio: opcional,
  localidad: opcional,
}).strict();
export const actividad = z.object({
  descripcion: texto.describe('Descripción de la actividad.'),
  fechaCompromiso: fecha.nullable().optional().describe('Null u omitida: sin fecha de compromiso.'),
  fechaFinalizacion: fecha.nullable().optional().describe('Solo al completar la actividad; null u omitida: pendiente.'),
}).strict();
const cambio = (datos: object) => Object.values(datos).some((valor) => valor !== undefined);
export const cambiosCliente = cliente.partial().refine(cambio, 'Indicá al menos un campo para modificar.');
export const cambiosActividad = actividad.partial().refine(cambio, 'Indicá al menos un campo para modificar.');

export const filtroCliente = z.union([texto, z.object({
  id: z.union([id, texto]).optional(),
  nombre: texto.optional(), apellido: texto.optional(), email: texto.optional(),
  telefono: opcional, domicilio: opcional, localidad: opcional,
}).strict()]).describe('Texto libre o filtros por cualquier campo combinados con AND. Texto parcial sin mayúsculas ni acentos; null busca valores nulos.');
export const filtroActividad = z.union([texto, z.object({
  id: z.union([id, texto]).optional(), clienteId: z.union([id, texto]).optional(),
  descripcion: texto.optional(), fechaCompromiso: opcional, fechaFinalizacion: opcional,
  estado: texto.optional().describe('pendiente, vencida o completada; también admite texto parcial.'),
}).strict()]).describe('Texto libre o filtros por campos de la actividad, incluido estado.');
