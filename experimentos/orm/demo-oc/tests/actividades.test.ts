import { beforeEach, describe, expect, it } from "vitest";
import type { Cliente } from "../src/db/schema.js";
import { ClienteRepository } from "../src/servicios/cliente-repository.js";
import { nuevaDb } from "./test-db.js";

const DIA = 24 * 60 * 60 * 1000;
const HOY = new Date("2026-06-15T10:00:00");
const enDias = (dias: number) => new Date(HOY.getTime() + dias * DIA);

describe("ClienteRepository: actividades", () => {
  let cliente: Cliente;

  beforeEach(() => {
    ClienteRepository.configurar(nuevaDb());
    cliente = ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });
  });

  it("crea una actividad pendiente, sin fechas", () => {
    const actividad = ClienteRepository.crearActividad(cliente.id, { descripcion: "  Definir   alcance " });

    expect(actividad).toMatchObject({
      clienteId: cliente.id,
      descripcion: "Definir alcance",
      fechaCompromiso: null,
      fechaFinalizacion: null,
    });
    expect(ClienteRepository.estaCompletada(actividad)).toBe(false);
  });

  it("no deja crear una actividad sin cliente", () => {
    expect(() => ClienteRepository.crearActividad(999, { descripcion: "Huérfana" })).toThrow(/No existe el cliente/);
  });

  it("completa la actividad asignando la fecha de finalización", () => {
    const actividad = ClienteRepository.crearActividad(cliente.id, { descripcion: "Firmar contrato" });

    const completada = ClienteRepository.completarActividad(cliente.id, actividad.id, new Date("2026-06-20T12:00:00"));

    expect(completada.fechaFinalizacion).toEqual(new Date("2026-06-20T12:00:00"));
    expect(ClienteRepository.estaCompletada(completada)).toBe(true);
    expect(ClienteRepository.listarActividades(cliente.id, { estado: "pendiente" })).toEqual([]);
  });

  it("no reescribe la fecha de una actividad ya completada", () => {
    const actividad = ClienteRepository.crearActividad(cliente.id, { descripcion: "Firmar contrato" });
    const original = ClienteRepository.completarActividad(cliente.id, actividad.id, new Date("2026-06-20T12:00:00"));

    const otraVez = ClienteRepository.completarActividad(cliente.id, actividad.id, new Date("2026-07-01T09:00:00"));

    expect(otraVez).toEqual(original);
  });

  it("no completa ni edita ni borra una actividad inexistente", () => {
    expect(() => ClienteRepository.completarActividad(cliente.id, 999)).toThrow(/no tiene la actividad/);
    expect(() => ClienteRepository.actualizarActividad(cliente.id, 999, { descripcion: "x" })).toThrow(
      /no tiene la actividad/,
    );
    expect(() => ClienteRepository.eliminarActividad(cliente.id, 999)).toThrow(/no tiene la actividad/);
  });

  it("no accede a una actividad de otro cliente", () => {
    const otro = ClienteRepository.crear({ nombre: "Bruno", apellido: "Fernández", email: "bruno@example.com" });
    const actividad = ClienteRepository.crearActividad(cliente.id, { descripcion: "De Ana" });

    expect(ClienteRepository.obtenerActividad(otro.id, actividad.id)).toBeUndefined();
    expect(ClienteRepository.obtenerActividad(cliente.id, actividad.id)?.id).toBe(actividad.id);

    expect(() => ClienteRepository.completarActividad(otro.id, actividad.id)).toThrow(/no tiene la actividad/);
    expect(() => ClienteRepository.actualizarActividad(otro.id, actividad.id, { descripcion: "x" })).toThrow(
      /no tiene la actividad/,
    );
    expect(() => ClienteRepository.eliminarActividad(otro.id, actividad.id)).toThrow(/no tiene la actividad/);

    // La actividad sigue intacta y sigue siendo de Ana.
    expect(ClienteRepository.obtenerActividad(cliente.id, actividad.id)).toMatchObject({
      descripcion: "De Ana",
      fechaFinalizacion: null,
    });
  });

  it("considera vencida a la pendiente con fecha anterior a hoy", () => {
    const vencida = ClienteRepository.crearActividad(cliente.id, {
      descripcion: "Ayer",
      fechaCompromiso: enDias(-1),
    });
    const deHoy = ClienteRepository.crearActividad(cliente.id, {
      descripcion: "Hoy",
      fechaCompromiso: new Date("2026-06-15T00:00:00"),
    });
    const futura = ClienteRepository.crearActividad(cliente.id, {
      descripcion: "Mañana",
      fechaCompromiso: enDias(1),
    });
    const sinFecha = ClienteRepository.crearActividad(cliente.id, { descripcion: "Sin fecha" });
    let completada = ClienteRepository.crearActividad(cliente.id, {
      descripcion: "Completada y vencida",
      fechaCompromiso: enDias(-5),
    });
    completada = ClienteRepository.completarActividad(cliente.id, completada.id, enDias(-4));

    expect(ClienteRepository.estaVencida(vencida, HOY)).toBe(true);
    expect(ClienteRepository.estaVencida(deHoy, HOY)).toBe(false);
    expect(ClienteRepository.estaVencida(futura, HOY)).toBe(false);
    expect(ClienteRepository.estaVencida(sinFecha, HOY)).toBe(false);
    expect(ClienteRepository.estaVencida(completada, HOY)).toBe(false);

    expect(ClienteRepository.listarActividades(cliente.id, { estado: "vencida" }, HOY).map((a) => a.descripcion)).toEqual([
      "Ayer",
    ]);
  });

  it("filtra actividades por estado", () => {
    const pendiente = ClienteRepository.crearActividad(cliente.id, {
      descripcion: "Pendiente",
      fechaCompromiso: enDias(3),
    });
    const completada = ClienteRepository.crearActividad(cliente.id, { descripcion: "Completada" });
    ClienteRepository.completarActividad(cliente.id, completada.id, enDias(-1));

    expect(ClienteRepository.listarActividades(cliente.id, { estado: "pendiente" }).map((a) => a.id)).toEqual([
      pendiente.id,
    ]);
    expect(ClienteRepository.listarActividades(cliente.id, { estado: "completada" }).map((a) => a.id)).toEqual([
      completada.id,
    ]);
    expect(ClienteRepository.contarActividades(cliente.id, { estado: "completada" })).toBe(1);
  });

  it("las listas de un cliente no mezclan actividades de otro", () => {
    const otro = ClienteRepository.crear({ nombre: "Bruno", apellido: "Fernández", email: "bruno@example.com" });
    ClienteRepository.crearActividad(cliente.id, { descripcion: "De Ana" });
    ClienteRepository.crearActividad(otro.id, { descripcion: "De Bruno" });

    expect(ClienteRepository.listarActividades(cliente.id).map((a) => a.descripcion)).toEqual(["De Ana"]);
    expect(ClienteRepository.listarActividades(otro.id).map((a) => a.descripcion)).toEqual(["De Bruno"]);
    expect(ClienteRepository.contarActividades(cliente.id)).toBe(1);
    expect(ClienteRepository.contarActividades(otro.id)).toBe(1);
  });

  it("ordena por fecha de compromiso y deja las sin fecha al final", () => {
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Sin fecha" });
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Lejana", fechaCompromiso: enDias(10) });
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Cercana", fechaCompromiso: enDias(1) });

    expect(ClienteRepository.listarActividades(cliente.id).map((a) => a.descripcion)).toEqual([
      "Cercana",
      "Lejana",
      "Sin fecha",
    ]);
  });

  it("filtra actividades por descripción, rango de fechas y sin fecha", () => {
    const objetivo = ClienteRepository.crearActividad(cliente.id, {
      descripcion: "Enviar propuesta comercial",
      fechaCompromiso: enDias(-10),
    });
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Sin fecha de compromiso" });

    expect(ClienteRepository.listarActividades(cliente.id, { descripcion: "propuesta" }).map((a) => a.id)).toEqual([
      objetivo.id,
    ]);
    expect(
      ClienteRepository.listarActividades(cliente.id, { compromisoDesde: enDias(-15), compromisoHasta: enDias(-5) }),
    ).toHaveLength(1);
    expect(ClienteRepository.listarActividades(cliente.id, { sinFecha: true }).map((a) => a.descripcion)).toEqual([
      "Sin fecha de compromiso",
    ]);
  });

  it("edita una actividad pendiente", () => {
    const actividad = ClienteRepository.crearActividad(cliente.id, { descripcion: "Original" });

    const editada = ClienteRepository.actualizarActividad(cliente.id, actividad.id, {
      descripcion: "  Editada ",
      fechaCompromiso: enDias(2),
    });

    expect(editada.descripcion).toBe("Editada");
    expect(editada.fechaCompromiso).toEqual(enDias(2));
    expect(editada.fechaFinalizacion).toBeNull();
  });

  it("no permite editar ni borrar una actividad completada", () => {
    const completada = ClienteRepository.crearActividad(cliente.id, { descripcion: "Completada" });
    ClienteRepository.completarActividad(cliente.id, completada.id);

    expect(() => ClienteRepository.actualizarActividad(cliente.id, completada.id, { descripcion: "Otra" })).toThrow(
      /completada/,
    );
    expect(() => ClienteRepository.eliminarActividad(cliente.id, completada.id)).toThrow(/completada/);
    expect(ClienteRepository.obtenerActividad(cliente.id, completada.id)?.descripcion).toBe("Completada");
  });

  it("borra una actividad pendiente", () => {
    const pendiente = ClienteRepository.crearActividad(cliente.id, { descripcion: "Pendiente" });

    expect(ClienteRepository.eliminarActividad(cliente.id, pendiente.id)).toBe(true);
    expect(ClienteRepository.obtenerActividad(cliente.id, pendiente.id)).toBeUndefined();
  });

  it("resume el estado del conjunto", () => {
    const completada = ClienteRepository.crearActividad(cliente.id, {
      descripcion: "Completada",
      fechaCompromiso: enDias(-2),
    });
    ClienteRepository.completarActividad(cliente.id, completada.id, enDias(-1));
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Vencida", fechaCompromiso: enDias(-3) });
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Pendiente con fecha", fechaCompromiso: enDias(4) });
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Pendiente sin fecha" });

    expect(ClienteRepository.resumen(cliente.id, HOY)).toEqual({
      cliente,
      actividades: { total: 4, pendientes: 3, completadas: 1, vencidas: 1, sinFecha: 1 },
    });
    expect(() => ClienteRepository.resumen(999)).toThrow(/No existe el cliente/);
  });
});
