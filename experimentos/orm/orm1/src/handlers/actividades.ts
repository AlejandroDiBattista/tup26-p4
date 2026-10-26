import type { RequestHandler } from "express";
import { ActividadesRepositorio } from "../repositorios/actividades.js";
import type { NuevaActividad } from "../db/schema.js";

function idDesdeRuta(id: string) {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
}

function parametroId(id: string | string[] | undefined) {
  return idDesdeRuta(Array.isArray(id) ? id[0] ?? "" : id ?? "");
}

function normalizarFechas(datos: unknown) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) return null;

  const valores = { ...datos } as Record<string, unknown>;
  for (const campo of ["fecha", "fechaCompletada"]) {
    const valor = valores[campo];
    if (typeof valor === "string") {
      const fecha = new Date(valor);
      if (Number.isNaN(fecha.getTime())) return null;
      valores[campo] = fecha;
    }
  }
  return valores;
}

export const listarActividades: RequestHandler = async (req, res, next) => {
  try {
    const { estado, clienteId } = req.query;
    if (estado !== undefined) {
      if (estado === "pendiente") return void res.json(await ActividadesRepositorio.listarPendientes());
      if (estado === "completa")  return void res.json(await ActividadesRepositorio.listarCompletadas());
      if (estado === "vencida")   return void res.json(await ActividadesRepositorio.listarVencidas());
      res.status(400).json({ error: "El estado debe ser pendiente, completa o vencida." });
      return;
    }
    if (clienteId !== undefined) {
      const id = idDesdeRuta(String(clienteId));
      if (!id) {
        res.status(400).json({ error: "clienteId debe ser un entero positivo." });
        return;
      }
      res.json(await ActividadesRepositorio.listarPorCliente(id));
      return;
    }
    res.json(await ActividadesRepositorio.listar());
  } catch (error) {
    next(error);
  }
};

export const obtenerActividad: RequestHandler = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const actividad = await ActividadesRepositorio.buscarPorId(id);
    if (!actividad) {
      res.status(404).json({ error: "Actividad no encontrada." });
      return;
    }
    res.json(actividad);
  } catch (error) {
    next(error);
  }
};

export const crearActividad: RequestHandler = async (req, res, next) => {
  try {
    const datos = normalizarFechas(req.body);
    if (!datos) {
      res.status(400).json({ error: "El cuerpo debe ser un objeto y las fechas deben ser válidas." });
      return;
    }
    const actividad = await ActividadesRepositorio.crear(datos as unknown as NuevaActividad);
    res.status(201).json(actividad);
  } catch (error) {
    next(error);
  }
};

export const actualizarActividad: RequestHandler = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const datos = normalizarFechas(req.body);
    if (!datos) {
      res.status(400).json({ error: "El cuerpo debe ser un objeto y las fechas deben ser válidas." });
      return;
    }
    const actividad = await ActividadesRepositorio.actualizar(id, datos as Partial<NuevaActividad>);
    if (!actividad) {
      res.status(404).json({ error: "Actividad no encontrada." });
      return;
    }
    res.json(actividad);
  } catch (error) {
    next(error);
  }
};

export const eliminarActividad: RequestHandler = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const actividad = await ActividadesRepositorio.eliminar(id);
    if (!actividad) {
      res.status(404).json({ error: "Actividad no encontrada." });
      return;
    }
    res.json(actividad);
  } catch (error) {
    next(error);
  }
};
