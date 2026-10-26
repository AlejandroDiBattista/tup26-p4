// Importamos la función Router de Express para definir rutas modulares
import { Router } from "express";

// Importamos las funciones controladoras correspondientes a clientes
import {
  actualizarCliente,
  buscarClientes,
  crearActividad,
  crearCliente,
  eliminarCliente,
  listarActividades,
  obtenerCliente,
} from "../controllers/clientes.controller.js";

// Instanciamos el enrutador de Express
const router = Router();

// GET /api/clientes -> Busca clientes o devuelve todos si no hay filtro
router.get("/", buscarClientes);

// POST /api/clientes -> Registra un nuevo cliente
router.post("/", crearCliente);

// GET /api/clientes/:id -> Obtiene un cliente específico por su ID con sus actividades
router.get("/:id", obtenerCliente);

// PUT /api/clientes/:id -> Actualiza los datos de un cliente
router.put("/:id", actualizarCliente);

// DELETE /api/clientes/:id -> Elimina un cliente y sus actividades asociadas
router.delete("/:id", eliminarCliente);

// GET /api/clientes/:id/actividades -> Lista todas las actividades de un cliente
router.get("/:id/actividades", listarActividades);

// POST /api/clientes/:id/actividades -> Crea una nueva actividad para ese cliente
router.post("/:id/actividades", crearActividad);

// Exportamos el router para ser montado en el servidor principal
export default router;
