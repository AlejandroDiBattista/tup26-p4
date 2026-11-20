import type { RequestHandler } from 'express';
import type { BaseDatos } from '../db';
import { ErrorHttp } from '../errors';
import { Clientes } from '../services/Clientes';
import type { NuevaCliente } from '../db/schema';

type Cuerpo = Record<string, unknown>;

function cuerpoDe(requestBody: unknown): Cuerpo {
  if (typeof requestBody !== 'object' || requestBody === null || Array.isArray(requestBody)) {
    throw new ErrorHttp(400, 'El cuerpo debe ser un objeto JSON.');
  }
  return requestBody as Cuerpo;
}

function texto(cuerpo: Cuerpo, campo: string, maximo: number, requerido = false) {
  const valor = cuerpo[campo];
  if (valor === undefined && !requerido) return '';
  if (typeof valor !== 'string') {
    throw new ErrorHttp(400, `El campo "${campo}" debe ser texto.`);
  }

  const limpio = valor.trim();
  if (requerido && limpio.length === 0) {
    throw new ErrorHttp(400, `El campo "${campo}" es obligatorio.`);
  }
  if (limpio.length > maximo) {
    throw new ErrorHttp(400, `El campo "${campo}" no puede superar ${maximo} caracteres.`);
  }
  return limpio;
}

function validarCliente(body: unknown): NuevaCliente {
  const datos = cuerpoDe(body);
  const email = texto(datos, 'email', 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErrorHttp(400, 'El email no tiene un formato válido.');
  }

  return {
    nombre: texto(datos, 'nombre', 100, true),
    apellido: texto(datos, 'apellido', 100, true),
    email,
    telefono: texto(datos, 'telefono', 50),
    empresa: texto(datos, 'empresa', 120),
    cargo: texto(datos, 'cargo', 120),
    notas: texto(datos, 'notas', 2000),
  };
}

function validarActividad(body: unknown) {
  const datos = cuerpoDe(body);
  const fecha = texto(datos, 'fecha', 10, true);
  const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
    Number.isNaN(fechaParseada.getTime()) ||
    fechaParseada.toISOString().slice(0, 10) !== fecha
  ) {
    throw new ErrorHttp(400, 'La fecha debe ser válida y tener el formato AAAA-MM-DD.');
  }

  return {
    titulo: texto(datos, 'titulo', 160, true),
    descripcion: texto(datos, 'descripcion', 2000),
    fecha,
  };
}

function idDe(valor: unknown) {
  if (typeof valor !== 'string') {
    throw new ErrorHttp(400, 'El identificador debe ser un entero positivo.');
  }
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new ErrorHttp(400, 'El identificador debe ser un entero positivo.');
  }
  return id;
}

function exigirCliente<T>(valor: T | null): T {
  if (valor === null) throw new ErrorHttp(404, 'No se encontró el cliente.');
  return valor;
}

function exigirActividad<T>(valor: T | null): T {
  if (valor === null) throw new ErrorHttp(404, 'No se encontró la actividad.');
  return valor;
}

export function listarClientes(db: BaseDatos): RequestHandler {
  return (req, res) => {
    const busqueda = req.query.q;
    if (busqueda !== undefined && typeof busqueda !== 'string') {
      throw new ErrorHttp(400, 'El parámetro de búsqueda debe ser texto.');
    }
    res.json(Clientes.listar(db, busqueda ?? ''));
  };
}

export function obtenerCliente(db: BaseDatos): RequestHandler {
  return (req, res) => res.json(exigirCliente(Clientes.obtener(db, idDe(req.params.id))));
}

export function crearCliente(db: BaseDatos): RequestHandler {
  return (req, res) => {
    const cliente = Clientes.crear(db, validarCliente(req.body));
    res.location(`/api/clientes/${cliente.id}`).status(201).json(cliente);
  };
}

export function actualizarCliente(db: BaseDatos): RequestHandler {
  return (req, res) => res.json(
    exigirCliente(Clientes.actualizar(db, idDe(req.params.id), validarCliente(req.body))),
  );
}

export function eliminarCliente(db: BaseDatos): RequestHandler {
  return (req, res) => {
    exigirCliente(Clientes.eliminar(db, idDe(req.params.id)));
    res.status(204).end();
  };
}

export function listarActividades(db: BaseDatos): RequestHandler {
  return (req, res) => {
    const clienteId = idDe(req.params.id);
    res.json(exigirCliente(Clientes.listarActividades(db, clienteId)));
  };
}

export function crearActividad(db: BaseDatos): RequestHandler {
  return (req, res) => {
    const clienteId = idDe(req.params.id);
    const actividad = exigirCliente(Clientes.crearActividad(db, clienteId, validarActividad(req.body)));
    res.location(`/api/clientes/${clienteId}/actividades/${actividad.id}`).status(201).json(actividad);
  };
}

export function actualizarActividad(db: BaseDatos): RequestHandler {
  return (req, res) => {
    res.json(exigirActividad(Clientes.actualizarActividad(
      db,
      idDe(req.params.id),
      idDe(req.params.actividadId),
      validarActividad(req.body),
    )));
  };
}

export function completarActividad(db: BaseDatos): RequestHandler {
  return (req, res) => res.json(exigirActividad(Clientes.completarActividad(
    db,
    idDe(req.params.id),
    idDe(req.params.actividadId),
  )));
}

export function eliminarActividad(db: BaseDatos): RequestHandler {
  return (req, res) => {
    exigirActividad(Clientes.eliminarActividad(
      db,
      idDe(req.params.id),
      idDe(req.params.actividadId),
    ));
    res.status(204).end();
  };
}
