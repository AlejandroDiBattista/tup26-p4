import type { Request, Response } from "express";
import type { NuevoCliente } from "../../db/schema.js";
import { NoEncontrado } from "../../servicios/errores.js";
import { ClienteRepository } from "../../servicios/cliente-repository.js";
import { cuerpoDe, numeroDeRuta, textoDeQuery } from "../peticion.js";
import { ErrorDeSolicitud } from "../errores.js";

const OBLIGATORIOS = ["nombre", "apellido", "email"];
const CAMPOS = [...OBLIGATORIOS, "domicilio", "localidad", "telefono"];

/** GET /api/clientes?buscar=texto */
export function listar(req: Request, res: Response): void {
  const texto = textoDeQuery(req.query.buscar);
  res.json(texto === undefined ? ClienteRepository.listar() : ClienteRepository.buscar(texto));
}

/** POST /api/clientes */
export function crear(req: Request, res: Response): void {
  const datos = cuerpoDe<NuevoCliente>(req.body, { obligatorios: OBLIGATORIOS, opcionales: CAMPOS });
  const cliente = ClienteRepository.crear(datos);

  res.status(201).location(`/api/clientes/${cliente.id}`).json(cliente);
}

/** GET /api/clientes/:clienteId */
export function obtener(req: Request, res: Response): void {
  const id = numeroDeRuta(req.params.clienteId, "clienteId");
  const cliente = ClienteRepository.obtener(id);
  if (!cliente) throw new NoEncontrado(`No existe el cliente ${id}`);

  res.json(cliente);
}

/** PUT|PATCH /api/clientes/:clienteId */
export function actualizar(req: Request, res: Response): void {
  const id = numeroDeRuta(req.params.clienteId, "clienteId");
  const cambios = cuerpoDe<Partial<NuevoCliente>>(req.body, {
    obligatorios: [],
    opcionales: CAMPOS,
    noVacios: OBLIGATORIOS,
  });
  if (Object.keys(cambios).length === 0) throw new ErrorDeSolicitud("No hay campos para actualizar");

  const cliente = ClienteRepository.actualizar(id, cambios);
  if (!cliente) throw new NoEncontrado(`No existe el cliente ${id}`);

  res.json(cliente);
}

/** DELETE /api/clientes/:clienteId */
export function eliminar(req: Request, res: Response): void {
  const id = numeroDeRuta(req.params.clienteId, "clienteId");
  if (!ClienteRepository.eliminar(id)) throw new NoEncontrado(`No existe el cliente ${id}`);

  res.status(204).end();
}
