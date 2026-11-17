import { z } from 'zod';

export const idContacto = z.number().int().positive();

export const datosContacto = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  telefono: z.string().trim().min(1, 'El teléfono es obligatorio'),
  email: z.string().trim().email('El email no es válido')
}).strict();

export const cambiosContacto = datosContacto.partial().refine(
  datos => Object.values(datos).some(valor => valor !== undefined),
  'Indicá al menos un campo para actualizar'
);

export const contacto = datosContacto.extend({ id: idContacto });
