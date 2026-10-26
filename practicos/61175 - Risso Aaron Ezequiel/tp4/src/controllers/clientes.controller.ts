import type { Request, RequestHandler, Response } from "express";
import { Clientes, ErrorServicio } from "../services/clientes.js";
import type {
  ActualizarActividadInput,
  ActualizarClienteInput,
  CrearActividadInput,
  CrearClienteInput,
} from "../services/clientes.js";

function responderError(res: Response, error: unknown): void {
  if (error instanceof ErrorServicio) {
    const status = {
      VALIDACION: 400,
      NO_ENCONTRADO: 404,
      CONFLICTO: 409,
    }[error.codigo];
    res.status(status).json({ error: { codigo: error.codigo, mensaje: error.message } });
    return;
  }

  res.status(500).json({
    error: { codigo: "INTERNO", mensaje: "Ocurrió un error interno." },
  });
}

function conManejoError(
  accion: (req: Request, res: Response) => void,
): RequestHandler {
  return (req, res, next) => {
    try {
      accion(req, res);
    } catch (error) {
      if (res.headersSent) {
        next(error);
        return;
      }
      responderError(res, error);
    }
  };
}

function leerBody(req: Request, res: Response): Record<string, unknown> | null {
  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({
      error: { codigo: "VALIDACION", mensaje: "El cuerpo debe ser un objeto JSON." },
    });
    return null;
  }
  return body as Record<string, unknown>;
}

function leerActividadBody(
  req: Request,
  res: Response,
  parcial: boolean,
): CrearActividadInput | ActualizarActividadInput | null {
  const body = leerBody(req, res);
  if (!body) return null;

  const datos: Record<string, unknown> = {};
  if (Object.hasOwn(body, "descripcion")) datos.descripcion = body.descripcion;

  if (Object.hasOwn(body, "fechaCompromiso")) {
    const fecha = body.fechaCompromiso;
    if (fecha === null) {
      datos.fechaCompromiso = null;
    } else if (typeof fecha === "string") {
      const fechaConvertida = new Date(fecha);
      if (Number.isNaN(fechaConvertida.getTime())) {
        res.status(400).json({
          error: { codigo: "VALIDACION", mensaje: "fechaCompromiso debe ser una fecha ISO válida o null." },
        });
        return null;
      }
      datos.fechaCompromiso = fechaConvertida;
    } else {
      res.status(400).json({
        error: { codigo: "VALIDACION", mensaje: "fechaCompromiso debe ser una fecha ISO válida o null." },
      });
      return null;
    }
  } else if (!parcial) {
    datos.fechaCompromiso = null;
  }

  return datos as CrearActividadInput | ActualizarActividadInput;
}

export const listar = conManejoError((_req, res) => {
  res.status(200).json({ datos: Clientes.listar() });
});

export const buscar = conManejoError((req, res) => {
  const termino = req.query.termino;
  if (typeof termino !== "string") {
    res.status(400).json({
      error: { codigo: "VALIDACION", mensaje: "El parámetro de búsqueda 'termino' es obligatorio." },
    });
    return;
  }
  res.status(200).json({ datos: Clientes.buscar(termino) });
});

export const crear = conManejoError((req, res) => {
  const body = leerBody(req, res);
  if (!body) return;
  const cliente = Clientes.crear(body as unknown as CrearClienteInput);
  res.status(201).json({ datos: cliente });
});

export const editar = conManejoError((req, res) => {
  const body = leerBody(req, res);
  if (!body) return;
  const cliente = Clientes.actualizar(
    Number(req.params.clienteId),
    body as ActualizarClienteInput,
  );
  res.status(200).json({ datos: cliente });
});

export const eliminar = conManejoError((req, res) => {
  const cliente = Clientes.eliminar(Number(req.params.clienteId));
  res.status(200).json({ datos: cliente });
});

export const listarActividades = conManejoError((req, res) => {
  const actividades = Clientes.listarActividades(Number(req.params.clienteId));
  res.status(200).json({ datos: actividades });
});

export const crearActividad = conManejoError((req, res) => {
  const body = leerActividadBody(req, res, false);
  if (!body) return;
  const actividad = Clientes.crearActividad(
    Number(req.params.clienteId),
    body as CrearActividadInput,
  );
  res.status(201).json({ datos: actividad });
});

export const editarActividad = conManejoError((req, res) => {
  const body = leerActividadBody(req, res, true);
  if (!body) return;
  const actividad = Clientes.actualizarActividadDeCliente(
    Number(req.params.clienteId),
    Number(req.params.actividadId),
    body as ActualizarActividadInput,
  );
  res.status(200).json({ datos: actividad });
});

export const completarActividad = conManejoError((req, res) => {
  const actividad = Clientes.completarActividadDeCliente(
    Number(req.params.clienteId),
    Number(req.params.actividadId),
  );
  res.status(200).json({ datos: actividad });
});

export const eliminarActividad = conManejoError((req, res) => {
  const actividad = Clientes.eliminarActividadDeCliente(
    Number(req.params.clienteId),
    Number(req.params.actividadId),
  );
  res.status(200).json({ datos: actividad });
});
