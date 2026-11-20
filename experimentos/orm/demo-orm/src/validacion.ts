import { z } from 'zod';

export const idValido = z.number().int().positive();
export const fechaCalendario = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa AAAA-MM-DD').refine(valor => {
  const fecha = new Date(`${valor}T12:00:00Z`);
  return !isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}, 'Fecha de calendario inválida');

export const camposCliente = {
  nombre: z.string().trim().min(1).max(100),
  apellido: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  telefono: z.string().trim().max(40).nullable().optional(),
};
export const camposActividad = {
  descripcion: z.string().trim().min(1).max(1000),
  fecha: fechaCalendario.nullable().optional(),
  fechaCompromiso: fechaCalendario.nullable().optional(),
};
export const datosCliente = z.object(camposCliente).strict();
export const cambiosCliente = datosCliente.partial();
export const datosActividad = z.object(camposActividad).strict();
export const cambiosActividad = datosActividad.partial();
export const filtroActividad = z.enum(['todas', 'pendientes', 'vencidas', 'sin-compromiso']);

export function hoyTucuman(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Tucuman', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(ahora);
  const parte = (tipo: string) => partes.find(p => p.type === tipo)!.value;
  return `${parte('year')}-${parte('month')}-${parte('day')}`;
}
