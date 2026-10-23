import { eq, and, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { actividades, type NuevaActividad } from "../db/schema.js";

export class ActividadesRepositorio {
  static listar() {
    return db.select().from(actividades);
  }

  static listarPorCliente(clienteId: number) {
    return db.select().from(actividades).where(eq(actividades.clienteId, clienteId));
  }

  static listarPendientes() {
    return db.select().from(actividades).where(eq(actividades.estado, "pendiente"));
  }

  static listarVencidas() {
    return db
      .select()
      .from(actividades)
      .where(and(eq(actividades.estado, "pendiente"), lt(actividades.fecha, new Date())));
  }

  static listarCompletadas() {
    return db.select().from(actividades).where(eq(actividades.estado, "completa"));
  }

  static buscarPorId(id: number) {
    return db.select().from(actividades).where(eq(actividades.id, id)).get();
  }

  static crear(datos: NuevaActividad) {
    return db.insert(actividades).values(datos).returning().get();
  }

  static actualizar(id: number, datos: Partial<NuevaActividad>) {
    return db.update(actividades).set(datos).where(eq(actividades.id, id)).returning().get();
  }

  static eliminar(id: number) {
    return db.delete(actividades).where(eq(actividades.id, id)).returning().get();
  }
}

export function idDesdeRuta(id: string) {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
}

export function parametroId(id: string | string[] | undefined) {
  return idDesdeRuta(Array.isArray(id) ? id[0] ?? "" : id ?? "");
}

export const listarActividades: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    const { estado, clienteId } = req.query;
    if (estado !== undefined) {
      if (estado === "pendiente") return void res.json(await ActividadesRepositorio.listarPendientes());
      if (estado === "completa") return void res.json(await ActividadesRepositorio.listarCompletadas());
      if (estado === "vencida") return void res.json(await ActividadesRepositorio.listarVencidas());
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

export const obtenerActividad: (req: any, res: any, next: any) => any = async (req, res, next) => {
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

export const crearActividad: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    const actividad = await ActividadesRepositorio.crear(req.body);
    res.status(201).json(actividad);
  } catch (error) {
    next(error);
  }
};

export const actualizarActividad: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const actividad = await ActividadesRepositorio.actualizar(id, req.body);
    if (!actividad) {
      res.status(404).json({ error: "Actividad no encontrada." });
      return;
    }
    res.json(actividad);
  } catch (error) {
    next(error);
  }
};

export const eliminarActividad: (req: any, res: any, next: any) => any = async (req, res, next) => {
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
