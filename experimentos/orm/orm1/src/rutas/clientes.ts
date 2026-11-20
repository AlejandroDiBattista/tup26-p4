import { Router } from "express";
import {
  actualizarCliente,
  buscarClientes,
  crearCliente,
  eliminarCliente,
  listarClientes,
  obtenerCliente,
} from "../handlers/clientes.js";

export const rutasClientes = Router();

rutasClientes.get("/buscar", buscarClientes);
rutasClientes.get("/", listarClientes);
rutasClientes.get("/:id", obtenerCliente);
rutasClientes.post("/", crearCliente);
rutasClientes.put("/:id", actualizarCliente);
rutasClientes.delete("/:id", eliminarCliente);
