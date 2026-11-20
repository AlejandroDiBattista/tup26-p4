import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../src/db/client.js";
import { seed } from "../src/db/seed.js";
import { ClienteRepository } from "../src/servicios/cliente-repository.js";
import { nuevaDb } from "./test-db.js";

// No hay acceso global a actividades: siempre se llega por su cliente.
const clientes = () => ClienteRepository.listar();
const actividades = () => clientes().flatMap((c) => ClienteRepository.listarActividades(c.id));
const primeraActividad = () => {
  const actividad = actividades()[0];
  if (!actividad) throw new Error("La semilla no cargó actividades");
  return actividad;
};

describe("seed", () => {
  let db: Db;

  beforeEach(() => {
    db = nuevaDb();
    seed(db); // `seed` configura el repositorio con esta conexión
  });

  it("siembra 10 clientes", () => {
    expect(ClienteRepository.contar()).toBe(10);
  });

  it("cada cliente tiene al menos una actividad", () => {
    const sinActividades = clientes().filter((c) => ClienteRepository.listarActividades(c.id).length === 0);

    expect(sinActividades).toEqual([]);
  });

  it("normaliza los datos cargados", () => {
    const ana = ClienteRepository.buscar("ANA.GOMEZ")[0];

    expect(ana).toMatchObject({
      nombre: "Ana",
      apellido: "Gómez",
      telefono: "+541155551001",
      localidad: "Buenos Aires",
    });
  });

  it("incluye actividades completadas y pendientes", () => {
    const conCompletadas = clientes().some((c) =>
      ClienteRepository.contarActividades(c.id, { estado: "completada" }) > 0,
    );
    const conPendientes = clientes().some((c) => ClienteRepository.contarActividades(c.id, { estado: "pendiente" }) > 0);

    expect(conCompletadas).toBe(true);
    expect(conPendientes).toBe(true);
  });

  it("incluye pendientes vencidas y sin fecha de compromiso", () => {
    const vencidas = actividades().filter((a) => ClienteRepository.estaVencida(a));
    const sinFecha = actividades().filter((a) => a.fechaCompromiso === null);

    expect(vencidas.length).toBeGreaterThan(0);
    expect(vencidas.every((a) => a.fechaFinalizacion === null)).toBe(true);
    expect(sinFecha.length).toBeGreaterThan(0);
  });

  it("cada actividad se alcanza desde su cliente y solo desde él", () => {
    const actividad = primeraActividad();
    const otros = clientes().filter((c) => c.id !== actividad.clienteId);

    expect(ClienteRepository.obtenerActividad(actividad.clienteId, actividad.id)).toMatchObject({ id: actividad.id });
    expect(otros.every((c) => ClienteRepository.obtenerActividad(c.id, actividad.id) === undefined)).toBe(true);
  });

  it("no duplica ni modifica datos al repetir la carga", () => {
    const antes = clientes().map((c) => ({ cliente: c, actividades: ClienteRepository.listarActividades(c.id) }));

    const segunda = seed(db);

    const despues = clientes().map((c) => ({ cliente: c, actividades: ClienteRepository.listarActividades(c.id) }));
    expect(segunda.clientesNuevos).toBe(0);
    expect(segunda.actividadesNuevas).toBe(0);
    expect(despues).toEqual(antes); // tampoco se mueven las fechas
  });

  it("agrega solo lo nuevo si la semilla crece", () => {
    const totalAntes = actividades().length;
    ClienteRepository.crear({ nombre: "Nuevo", apellido: "Cliente", email: "nuevo@example.com" });

    seed(db);

    expect(ClienteRepository.contar()).toBe(11);
    expect(actividades().length).toBe(totalAntes);
  });
});
