import type { Request } from "express";
import type { ActividadNueva, ClienteNuevo } from "../esquema.js";
import { ErrorHttp } from "./errores.js";

type CambiosCliente = Omit<Partial<ClienteNuevo>, "id">;
type NuevaActividad = Omit<ActividadNueva, "id" | "clienteId" | "fechaFinalizacion">;
type CambiosActividad = Partial<NuevaActividad>;

function objetoJson(valor: unknown): Record<string, unknown> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    throw new ErrorHttp(400, "El cuerpo debe ser un objeto JSON.");
  }
  return valor as Record<string, unknown>;
}

function validarCampos(
  datos: Record<string, unknown>,
  campos: string[]
) {
  const desconocidos = Object.keys(datos).filter(campo => !campos.includes(campo));
  if (desconocidos.length) {
    throw new ErrorHttp(400, `Campo(s) no permitido(s): ${desconocidos.join(", ")}.`);
  }
}

function validarFecha(valor: unknown, campo: string): string | null {
  const fecha = typeof valor === "string" ? new Date(`${valor}T00:00:00Z`) : null;
  if (valor === null) return null;
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor) ||
    !fecha ||
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== valor
  ) {
    throw new ErrorHttp(400, `"${campo}" debe ser una fecha con formato AAAA-MM-DD o null.`);
  }
  return valor;
}

export function idDeRuta(request: Request, nombre: string) {
  const id = Number(request.params[nombre]);
  if (!Number.isInteger(id) || id < 1) {
    throw new ErrorHttp(400, `"${nombre}" debe ser un entero positivo.`);
  }
  return id;
}

export function datosNuevoCliente(valor: unknown): ClienteNuevo {
  const datos = objetoJson(valor);
  validarCampos(datos, ["nombre", "apellido", "email", "telefono"]);

  for (const campo of ["nombre", "apellido", "email"]) {
    if (typeof datos[campo] !== "string" || !datos[campo].trim()) {
      throw new ErrorHttp(400, `"${campo}" es obligatorio y debe ser texto.`);
    }
  }
  if (datos.telefono !== undefined && datos.telefono !== null && typeof datos.telefono !== "string") {
    throw new ErrorHttp(400, `"telefono" debe ser texto o null.`);
  }

  return datos as ClienteNuevo;
}

export function datosCambiosCliente(valor: unknown): CambiosCliente {
  const datos = objetoJson(valor);
  validarCampos(datos, ["nombre", "apellido", "email", "telefono"]);
  if (!Object.keys(datos).length) {
    throw new ErrorHttp(400, "Indica al menos un campo para actualizar.");
  }
  for (const campo of ["nombre", "apellido", "email"]) {
    if (campo in datos && (typeof datos[campo] !== "string" || !datos[campo].trim())) {
      throw new ErrorHttp(400, `"${campo}" debe ser texto no vacío.`);
    }
  }
  if ("telefono" in datos && datos.telefono !== null && typeof datos.telefono !== "string") {
    throw new ErrorHttp(400, `"telefono" debe ser texto o null.`);
  }
  return datos as CambiosCliente;
}

export function datosNuevaActividad(valor: unknown): NuevaActividad {
  const datos = objetoJson(valor);
  validarCampos(datos, ["descripcion", "fecha", "fechaCompromiso"]);
  if (typeof datos.descripcion !== "string" || !datos.descripcion.trim()) {
    throw new ErrorHttp(400, `"descripcion" es obligatoria y debe ser texto.`);
  }
  const fecha = datos.fecha === undefined ? undefined : validarFecha(datos.fecha, "fecha");
  const fechaCompromiso = datos.fechaCompromiso === undefined
    ? undefined
    : validarFecha(datos.fechaCompromiso, "fechaCompromiso");
  return {
    descripcion: datos.descripcion,
    ...(fecha !== undefined && { fecha }),
    ...(fechaCompromiso !== undefined && { fechaCompromiso })
  };
}

export function datosCambiosActividad(valor: unknown): CambiosActividad {
  const datos = objetoJson(valor);
  validarCampos(datos, ["descripcion", "fecha", "fechaCompromiso"]);
  if (!Object.keys(datos).length) {
    throw new ErrorHttp(400, "Indica al menos un campo para actualizar.");
  }
  if ("descripcion" in datos && (typeof datos.descripcion !== "string" || !datos.descripcion.trim())) {
    throw new ErrorHttp(400, `"descripcion" debe ser texto no vacío.`);
  }
  const cambios: CambiosActividad = {};
  if ("descripcion" in datos) cambios.descripcion = datos.descripcion as string;
  if ("fecha" in datos) cambios.fecha = validarFecha(datos.fecha, "fecha");
  if ("fechaCompromiso" in datos) {
    cambios.fechaCompromiso = validarFecha(datos.fechaCompromiso, "fechaCompromiso");
  }
  return cambios;
}
