import { eq, or, like } from "drizzle-orm";
import { db } from "../db/index.js";
import { clientes, type NuevoCliente } from "../db/schema.js";

export class ClientesRepositorio {
  static listar() {
    return db.select().from(clientes);
  }

  static buscarPorId(id: number) {
    return db.select().from(clientes).where(eq(clientes.id, id)).get();
  }

  static buscar(termino: string) {
    const patron = `%${termino}%`;
    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, patron),
          like(clientes.apellido, patron),
          like(clientes.telefono, patron),
          like(clientes.email, patron),
        ),
      );
  }

  static crear(datos: NuevoCliente) {
    return db.insert(clientes).values(datos).returning().get();
  }

  static actualizar(id: number, datos: Partial<NuevoCliente>) {
    return db.update(clientes).set(datos).where(eq(clientes.id, id)).returning().get();
  }

  static eliminar(id: number) {
    return db.delete(clientes).where(eq(clientes.id, id)).returning().get();
  }
}

export function idDesdeRuta(id: string) {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
}

export function parametroId(id: string | string[] | undefined) {
  return idDesdeRuta(Array.isArray(id) ? id[0] ?? "" : id ?? "");
}

export const listarClientes: (req: any, res: any, next: any) => any = async (_req, res, next) => {
  try {
    res.json(await ClientesRepositorio.listar());
  } catch (error) {
    next(error);
  }
};

export const buscarClientes: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    res.json(await ClientesRepositorio.buscar(String(req.query.termino ?? "")));
  } catch (error) {
    next(error);
  }
};

export const obtenerCliente: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const cliente = await ClientesRepositorio.buscarPorId(id);
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

export const crearCliente: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    const cliente = await ClientesRepositorio.crear(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
};

export const actualizarCliente: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const cliente = await ClientesRepositorio.actualizar(id, req.body);
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

export const eliminarCliente: (req: any, res: any, next: any) => any = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const cliente = await ClientesRepositorio.eliminar(id);
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};
