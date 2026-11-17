import { FastMCP, UserError } from 'fastmcp';
import { z } from 'zod';
import { datosContacto, cambiosContacto, idContacto } from './esquemas.js';

export function crearServidor(repositorio) {
  const servidor = new FastMCP({ name: 'contactos', version: '1.0.0' });

  function registrar(nombre, descripcion, parametros, operacion, annotations) {
    servidor.addTool({
      name: nombre,
      description: descripcion,
      parameters: parametros,
      annotations: { openWorldHint: false, ...annotations },
      execute: async args => {
        try {
          return JSON.stringify(operacion(args));
        } catch (error) {
          throw new UserError(error.message);
        }
      }
    });
  }

  registrar('listar_contactos', 'Lista todos los contactos o busca un texto en cualquier campo, sin distinguir mayúsculas.',
    z.object({ filtro: z.string().optional() }).strict(),
    ({ filtro }) => repositorio.listar(filtro), { readOnlyHint: true });

  registrar('traer_contacto', 'Consulta un contacto por su ID.',
    z.object({ id: idContacto }).strict(),
    ({ id }) => repositorio.traer(id), { readOnlyHint: true });

  registrar('agregar_contacto', 'Agrega un contacto con nombre, teléfono y email. Genera el ID automáticamente.',
    datosContacto,
    datos => repositorio.agregar(datos), { readOnlyHint: false, destructiveHint: false });

  registrar('actualizar_contacto', 'Actualiza uno o más campos de un contacto. Conserva los campos omitidos y el ID.',
    z.object({ id: idContacto, datos: cambiosContacto }).strict(),
    ({ id, datos }) => repositorio.actualizar(id, datos),
    { readOnlyHint: false, destructiveHint: true, idempotentHint: true });

  registrar('eliminar_contacto', 'Elimina un contacto por su ID y devuelve el contacto eliminado.',
    z.object({ id: idContacto }).strict(),
    ({ id }) => repositorio.eliminar(id), { readOnlyHint: false, destructiveHint: true });

  return servidor;
}
