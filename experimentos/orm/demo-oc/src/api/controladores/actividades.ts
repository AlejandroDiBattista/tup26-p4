import type { Request, Response } from "express";
import { NoEncontrado } from "../../servicios/errores.js";
import { ClienteRepository, type DatosActividad } from "../../servicios/cliente-repository.js";
import { ErrorDeSolicitud } from "../errores.js";
import { criteriosDeActividad, fechaDe, numeroDeRuta } from "../peticion.js";

const idCliente = (req: Request) => numeroDeRuta(req.params.clienteId, "clienteId");
const idActividad = (req: Request) => numeroDeRuta(req.params.actividadId, "actividadId");

/** Body de una actividad: `descripcion` y `fechaCompromiso` (ISO o null). */
function leerActividad(body: unknown, descripcionObligatoria: boolean): Partial<DatosActividad> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ErrorDeSolicitud("Se espera un objeto JSON");
  }

  const datos = body as Record<string, unknown>;
  const salida: Partial<DatosActividad> = {};

  if (datos.descripcion !== undefined) {
    if (typeof datos.descripcion !== "string" || datos.descripcion.trim() === "") {
      throw new ErrorDeSolicitud('El campo "descripcion" debe ser texto no vacío');
    }
    salida.descripcion = datos.descripcion;
  } else if (descripcionObligatoria) {
    throw new ErrorDeSolicitud('El campo "descripcion" es obligatorio');
  }

  if (datos.fechaCompromiso !== undefined) {
    salida.fechaCompromiso =
      datos.fechaCompromiso === null ? null : fechaDe(datos.fechaCompromiso, "fechaCompromiso");
  }

  return salida;
}

/** GET /api/clientes/:clienteId/actividades?estado=&descripcion=&sinFecha=&compromisoDesde=&compromisoHasta= */
export function listar(req: Request, res: Response): void {
  res.json(ClienteRepository.listarActividades(idCliente(req), criteriosDeActividad(req.query)));
}

/** POST /api/clientes/:clienteId/actividades */
export function crear(req: Request, res: Response): void {
  const clienteId = idCliente(req);
  const datos = leerActividad(req.body, true);
  if (datos.descripcion === undefined) throw new ErrorDeSolicitud('El campo "descripcion" es obligatorio');

  const actividad = ClienteRepository.crearActividad(clienteId, {
    descripcion: datos.descripcion,
    fechaCompromiso: datos.fechaCompromiso,
  });

  res.status(201).location(`/api/clientes/${clienteId}/actividades/${actividad.id}`).json(actividad);
}

/** GET /api/clientes/:clienteId/actividades/:actividadId */
export function obtener(req: Request, res: Response): void {
  const clienteId = idCliente(req);
  const actividad = ClienteRepository.obtenerActividad(clienteId, idActividad(req));
  if (!actividad) throw new NoEncontrado(`El cliente ${clienteId} no tiene la actividad ${req.params.actividadId}`);

  res.json(actividad);
}

/** PUT|PATCH /api/clientes/:clienteId/actividades/:actividadId */
export function actualizar(req: Request, res: Response): void {
  const cambios = leerActividad(req.body, false);
  if (Object.keys(cambios).length === 0) throw new ErrorDeSolicitud("No hay campos para actualizar");

  res.json(ClienteRepository.actualizarActividad(idCliente(req), idActividad(req), cambios));
}

/** POST /api/clientes/:clienteId/actividades/:actividadId/completar */
export function completar(req: Request, res: Response): void {
  const cuerpo = typeof req.body === "object" && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const fecha = fechaDe(cuerpo.fecha, "fecha");

  res.json(ClienteRepository.completarActividad(idCliente(req), idActividad(req), fecha));
}

/** DELETE /api/clientes/:clienteId/actividades/:actividadId */
export function eliminar(req: Request, res: Response): void {
  ClienteRepository.eliminarActividad(idCliente(req), idActividad(req));
  res.status(204).end();
}
