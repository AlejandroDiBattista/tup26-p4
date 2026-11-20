import { count } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../src/db/client.js";
import { actividades } from "../src/db/schema.js";
import { ClienteRepository } from "../src/servicios/cliente-repository.js";
import { nuevaDb } from "./test-db.js";

describe("ClienteRepository: CRUD y búsqueda flexible", () => {
  let db: Db;

  beforeEach(() => {
    db = nuevaDb();
    ClienteRepository.configurar(db);
  });

  it("normaliza nombre, email y teléfono al guardar", () => {
    const cliente = ClienteRepository.crear({
      nombre: "  ana   GÓMEZ ",
      apellido: "gomez",
      email: "  Ana.Gomez@Example.COM ",
      telefono: "+54 11 5555-1001",
    });

    expect(cliente).toMatchObject({
      nombre: "Ana Gómez",
      apellido: "Gomez",
      email: "ana.gomez@example.com",
      telefono: "+541155551001",
    });
  });

  it("guarda los campos opcionales ausentes o vacíos como null", () => {
    const cliente = ClienteRepository.crear({
      nombre: "Ana",
      apellido: "Gómez",
      email: "ana@example.com",
      domicilio: "   ",
    });

    expect(cliente).toMatchObject({ domicilio: null, localidad: null, telefono: null });
  });

  it("rechaza emails duplicados sin distinguir mayúsculas", () => {
    ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });

    expect(() => ClienteRepository.crear({ nombre: "Otra", apellido: "Gómez", email: "ANA@Example.com" })).toThrow();
  });

  it("lista los clientes ordenados por apellido", () => {
    // SQLite ordena por bytes (sin ignorar acentos), así que el test usa apellidos sin tildes.
    ClienteRepository.crear({ nombre: "Ana", apellido: "Zarate", email: "z@example.com" });
    ClienteRepository.crear({ nombre: "Bruno", apellido: "Alvarez", email: "a@example.com" });

    expect(ClienteRepository.listar().map((c) => c.apellido)).toEqual(["Alvarez", "Zarate"]);
  });

  it("busca el texto en cualquiera de los campos", () => {
    const ana = ClienteRepository.crear({
      nombre: "Ana",
      apellido: "Gómez",
      email: "ana@example.com",
      domicilio: "Av. Rivadavia 1234",
      localidad: "Buenos Aires",
      telefono: "+54 11 5555-1001",
    });
    ClienteRepository.crear({ nombre: "Bruno", apellido: "Fernández", email: "bruno@example.com", localidad: "Rosario" });

    expect(ClienteRepository.buscar("ana").map((c) => c.id)).toEqual([ana.id]);
    expect(ClienteRepository.buscar("GÓMEZ").map((c) => c.id)).toEqual([ana.id]);
    expect(ClienteRepository.buscar("góm").map((c) => c.id)).toEqual([ana.id]);
    expect(ClienteRepository.buscar("ANA@Example.com").map((c) => c.id)).toEqual([ana.id]);
    expect(ClienteRepository.buscar("rivadavia").map((c) => c.id)).toEqual([ana.id]);
    expect(ClienteRepository.buscar("BUENOS").map((c) => c.id)).toEqual([ana.id]);
    // Los teléfonos se guardan solo con dígitos, así que se buscan con dígitos.
    expect(ClienteRepository.buscar("+54115555").map((c) => c.id)).toEqual([ana.id]);
  });

  it("busca por texto parcial y devuelve todas las coincidencias", () => {
    ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });
    ClienteRepository.crear({ nombre: "Bruno", apellido: "Fernández", email: "bruno@example.com" });

    expect(ClienteRepository.buscar("n").map((c) => c.apellido)).toEqual(["Fernández", "Gómez"]);
  });

  it("devuelve una lista vacía si nada coincide", () => {
    ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });

    expect(ClienteRepository.buscar("zzz")).toEqual([]);
  });

  it("con texto vacío devuelve todos los clientes", () => {
    ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });
    ClienteRepository.crear({ nombre: "Bruno", apellido: "Fernández", email: "bruno@example.com" });

    expect(ClienteRepository.buscar("  ").map((c) => c.apellido)).toEqual(["Fernández", "Gómez"]);
  });

  it("actualiza de forma parcial y normalizando", () => {
    const { id } = ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });

    const actualizado = ClienteRepository.actualizar(id, { telefono: "+54 11 4444-0000", localidad: " rosario " });

    expect(actualizado).toMatchObject({ telefono: "+541144440000", localidad: "rosario", email: "ana@example.com" });
    expect(ClienteRepository.obtener(id)).toEqual(actualizado);
  });

  it("devuelve undefined al actualizar o buscar un cliente inexistente", () => {
    expect(ClienteRepository.obtener(999)).toBeUndefined();
    expect(ClienteRepository.actualizar(999, { nombre: "Nadie" })).toBeUndefined();
    expect(ClienteRepository.conActividades(999)).toBeUndefined();
  });

  it("elimina el cliente junto con sus actividades, incluidas las completadas", () => {
    const cliente = ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });
    ClienteRepository.crearActividad(cliente.id, { descripcion: "Pendiente" });
    const completada = ClienteRepository.crearActividad(cliente.id, { descripcion: "Completada" });
    ClienteRepository.completarActividad(cliente.id, completada.id);

    expect(ClienteRepository.eliminar(cliente.id)).toBe(true);
    expect(ClienteRepository.obtener(cliente.id)).toBeUndefined();
    // Ya no se puede consultar sus actividades: el cliente no existe.
    expect(() => ClienteRepository.listarActividades(cliente.id)).toThrow(/No existe el cliente/);
    // Y las filas se borraron efectivamente de la base (cascada de la composición).
    expect(db.select({ total: count() }).from(actividades).get()?.total).toBe(0);
    expect(ClienteRepository.eliminar(cliente.id)).toBe(false);
  });

  it("muestra el cliente con su lista de actividades (1:n)", () => {
    const ana = ClienteRepository.crear({ nombre: "Ana", apellido: "Gómez", email: "ana@example.com" });
    const bruno = ClienteRepository.crear({ nombre: "Bruno", apellido: "Fernández", email: "bruno@example.com" });
    ClienteRepository.crearActividad(ana.id, { descripcion: "Primera" });
    ClienteRepository.crearActividad(ana.id, { descripcion: "Segunda" });
    ClienteRepository.crearActividad(bruno.id, { descripcion: "De otro cliente" });

    expect(ClienteRepository.conActividades(ana.id)?.actividades.map((a) => a.descripcion)).toEqual(["Primera", "Segunda"]);
  });
});
