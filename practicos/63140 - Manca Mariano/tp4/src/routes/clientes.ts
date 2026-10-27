// ══════════════════════════════════════════════════════════════════
// clientes.ts — Definición de Rutas (Router)
// ══════════════════════════════════════════════════════════════════
// El router mapea URLs + verbos HTTP a funciones controladoras.
// Cada ruta define:
//   - El verbo HTTP (GET, POST, PUT, PATCH, DELETE)
//   - La URL relativa (montada bajo /api/clientes en server.ts)
//   - La función controladora que la maneja
//
// Los parámetros con ":" son dinámicos. Ej: /:id captura el valor
// de la URL y lo pone en req.params.id
// ══════════════════════════════════════════════════════════════════

import { Router } from "express";
import {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    listarActividades,
    crearActividad,
    actualizarActividad,
    completarActividad,
    eliminarActividad,
} from "../controllers/clientes";

// Creamos una instancia de Router de Express.
// Un Router es como una "mini-app" que agrupa rutas relacionadas.
const enrutador = Router();

// ── Rutas de Clientes ──────────────────────────────────────────────
// Estas rutas se montan en /api/clientes (ver server.ts)
enrutador.get   ("/",    listarClientes);        // GET  /api/clientes       → listar o buscar
enrutador.get   ("/:id", obtenerCliente);        // GET  /api/clientes/5     → obtener uno
enrutador.post  ("/",    crearCliente);          // POST /api/clientes       → crear nuevo
enrutador.put   ("/:id", actualizarCliente);     // PUT  /api/clientes/5     → actualizar
enrutador.delete("/:id", eliminarCliente);       // DEL  /api/clientes/5     → eliminar

// ── Rutas de Actividades (anidadas bajo un cliente) ────────────────
// Estas rutas están "anidadas": primero identifican al cliente (:id)
// y luego operan sobre sus actividades.
enrutador.get   ("/:id/actividades",                   listarActividades);   // GET    → listar actividades
enrutador.post  ("/:id/actividades",                   crearActividad);      // POST   → crear actividad
enrutador.put   ("/:id/actividades/:actId",            actualizarActividad); // PUT    → editar actividad
enrutador.patch ("/:id/actividades/:actId/completar",  completarActividad);  // PATCH  → marcar como completada
enrutador.delete("/:id/actividades/:actId",            eliminarActividad);   // DELETE → eliminar actividad

// Exportamos el enrutador para que server.ts lo monte
export default enrutador;
