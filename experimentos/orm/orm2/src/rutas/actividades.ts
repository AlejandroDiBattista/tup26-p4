import { Router } from "express";
import {
  actualizarActividad,
  crearActividad,
  eliminarActividad,
  listarActividades,
  obtenerActividad,
} from "../handlers/actividades.js";

export const rutasActividades = Router();

rutasActividades.get("/", listarActividades);
rutasActividades.get("/:id", obtenerActividad);
rutasActividades.post("/", crearActividad);
rutasActividades.put("/:id", actualizarActividad);
rutasActividades.delete("/:id", eliminarActividad);
