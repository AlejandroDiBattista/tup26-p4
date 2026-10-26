// Importamos los tipos de Express para solicitudes (Request) y respuestas (Response)
import type { Request, Response } from "express";

// Importamos la clase de servicio que contiene las operaciones y reglas
import { Clientes } from "../services/clientes.js";

// ============================================================================
// CONTROLADOR: buscarClientes (GET /api/clientes)
// ============================================================================
export async function buscarClientes(req: Request, res: Response) {
  try {
    // Tomamos el parámetro de búsqueda 'q' o 'busqueda' de la URL (si no viene, queda vacío)
    const termino = (req.query.q || req.query.busqueda || "") as string;

    // Llamamos al método estático de búsqueda en el servicio
    const lista = await Clientes.buscar(termino);

    // Retornamos la lista en formato JSON
    res.json(lista);
  } catch (error: any) {
    // En caso de fallo devolvemos código 500 y el mensaje de error
    res.status(500).json({ error: error.message || "Error al buscar clientes" });
  }
}

// ============================================================================
// CONTROLADOR: obtenerCliente (GET /api/clientes/:id)
// Retorna la ficha del cliente y sus actividades asociadas
// ============================================================================
export async function obtenerCliente(req: Request, res: Response) {
  try {
    // Convertimos el parámetro de la URL a número
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID proporcionado es inválido" });
    }

    // Buscamos los datos principales del cliente
    const cliente = await Clientes.obtenerPorId(id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Obtenemos todas sus actividades (compromisos y completadas)
    const actividades = await Clientes.listarActividades(id);

    // Devolvemos el cliente junto con el arreglo de sus actividades
    res.json({ ...cliente, actividades });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al obtener el cliente" });
  }
}

// ============================================================================
// CONTROLADOR: crearCliente (POST /api/clientes)
// ============================================================================
export async function crearCliente(req: Request, res: Response) {
  try {
    // Pasamos los datos del cuerpo (body) de la petición al servicio
    const nuevoCliente = await Clientes.crear(req.body);

    // Retornamos código 201 (Created) con el cliente generado
    res.status(201).json(nuevoCliente);
  } catch (error: any) {
    // Si faltan campos requeridos o el email está duplicado, respondemos 400 Bad Request
    const esErrorValidacion = error.message.includes("obligatorio") || error.message.includes("email");
    res.status(esErrorValidacion ? 400 : 500).json({ error: error.message });
  }
}

// ============================================================================
// CONTROLADOR: actualizarCliente (PUT /api/clientes/:id)
// ============================================================================
export async function actualizarCliente(req: Request, res: Response) {
  try {
    // Convertimos el ID a número
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID proporcionado es inválido" });
    }

    // Actualizamos el cliente con los datos recibidos en el cuerpo
    const clienteActualizado = await Clientes.actualizar(id, req.body);

    // Respondemos con el cliente actualizado
    res.json(clienteActualizado);
  } catch (error: any) {
    // Si no se encontró el cliente respondemos 404, de lo contrario 400
    const esNoEncontrado = error.message.includes("no encontrado");
    res.status(esNoEncontrado ? 404 : 400).json({ error: error.message });
  }
}

// ============================================================================
// CONTROLADOR: eliminarCliente (DELETE /api/clientes/:id)
// ============================================================================
export async function eliminarCliente(req: Request, res: Response) {
  try {
    // Convertimos el ID a número
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID proporcionado es inválido" });
    }

    // Llamamos al servicio para eliminar el cliente
    await Clientes.eliminar(id);

    // Respondemos con código 204 (No Content) indicando éxito sin cuerpo
    res.status(204).send();
  } catch (error: any) {
    const esNoEncontrado = error.message.includes("no encontrado");
    res.status(esNoEncontrado ? 404 : 500).json({ error: error.message });
  }
}

// ============================================================================
// CONTROLADOR: listarActividades (GET /api/clientes/:id/actividades)
// ============================================================================
export async function listarActividades(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID proporcionado es inválido" });
    }

    const actividades = await Clientes.listarActividades(id);
    res.json(actividades);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al listar las actividades" });
  }
}

// ============================================================================
// CONTROLADOR: crearActividad (POST /api/clientes/:id/actividades)
// ============================================================================
export async function crearActividad(req: Request, res: Response) {
  try {
    const clienteId = Number(req.params.id);
    if (isNaN(clienteId)) {
      return res.status(400).json({ error: "El ID de cliente es inválido" });
    }

    // Creamos la actividad asociada al cliente
    const nuevaActividad = await Clientes.crearActividad(clienteId, req.body);

    // Respondemos con 201 Created y los datos de la actividad
    res.status(201).json(nuevaActividad);
  } catch (error: any) {
    const esNoEncontrado = error.message.includes("no encontrado");
    res.status(esNoEncontrado ? 404 : 400).json({ error: error.message });
  }
}
