import { Router } from "express";

import {
  actualizarCliente,
  crearActividadCliente,
  crearCliente,
  eliminarCliente,
  listarActividadesCliente,
  listarClientes,
  obtenerCliente,
} from "../controllers/clientes.js";

export const rutasClientes = Router();

rutasClientes.get("/", listarClientes);
rutasClientes.post("/", crearCliente);
rutasClientes.get("/:id", obtenerCliente);
rutasClientes.patch("/:id", actualizarCliente);
rutasClientes.delete("/:id", eliminarCliente);
rutasClientes.get("/:id/actividades", listarActividadesCliente);
rutasClientes.post("/:id/actividades", crearActividadCliente);
