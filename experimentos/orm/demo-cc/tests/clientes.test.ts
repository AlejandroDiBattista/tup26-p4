import { beforeEach, describe, expect, it } from "vitest";
import { Clientes } from "../src/clientes/clientes.js";
import { hoy } from "../src/clientes/normalizar.js";
import { createDb } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { seed } from "../src/db/seed.js";
import { seedData } from "../src/db/seed-data.js";

const ayer = () => new Date(Date.now() - 864e5).toLocaleDateString("sv");
const manana = () => new Date(Date.now() + 864e5).toLocaleDateString("sv");

beforeEach(async () => {
  const db = createDb(":memory:");
  await runMigrations(db);
  Clientes.conectar(db);
});

describe("clientes", () => {
  it("normaliza nombre, email y teléfono al guardar", async () => {
    const c = await Clientes.crear({
      nombre: "  maría   josé ", apellido: "o'BRIEN-pérez", email: " Maria@Example.COM ",
      telefono: "+54 (341) 555-0101", localidad: "  ", domicilio: "  Alem   55 ",
    });
    expect(c).toMatchObject({
      nombre: "María José", apellido: "O'Brien-Pérez", email: "maria@example.com",
      telefono: "+543415550101", localidad: null, domicilio: "Alem 55",
    });
  });

  it("valida email y campos obligatorios", async () => {
    await expect(Clientes.crear({ nombre: "A", apellido: "B", email: "x" })).rejects.toThrow("Email inválido");
    await expect(Clientes.crear({ nombre: " ", apellido: "B", email: "a@b.co" })).rejects.toThrow("obligatorio");
  });

  it("busca por cualquier campo, parcial y combinado", async () => {
    await seed(Clientes.db);
    expect(await Clientes.buscar()).toHaveLength(10);
    expect(await Clientes.buscar({ apellido: "gómez" })).toHaveLength(1);
    expect(await Clientes.buscar({ localidad: "rosario", nombre: "lucía" })).toHaveLength(1);
    expect(await Clientes.buscar({ telefono: "341-555" })).toHaveLength(1);
    expect(await Clientes.buscar({ email: "EXAMPLE.com" })).toHaveLength(10);
    expect(await Clientes.buscar({ q: "mendoza" })).toHaveLength(1);
    expect((await Clientes.buscar({ q: "#2" })).map((c) => c.id)).toContain(2);
  });

  it("actualiza y elimina (con sus actividades)", async () => {
    const c = await Clientes.crear({ nombre: "Ana", apellido: "Paz", email: "ana@example.com" }, [{ descripcion: "Llamar" }]);
    expect(await Clientes.actualizar(c.id, { localidad: "salta  " })).toMatchObject({ localidad: "salta" });
    await Clientes.eliminar(c.id);
    expect(await Clientes.obtener(c.id)).toBeUndefined();
    expect(await Clientes.buscarActividades()).toHaveLength(0);
    await expect(Clientes.eliminar(c.id)).rejects.toThrow("no existe");
  });
});

describe("actividades", () => {
  let id: number;
  beforeEach(async () => {
    id = (await Clientes.crear({ nombre: "Ana", apellido: "Paz", email: "ana@example.com" })).id;
  });

  it("calcula el estado: completada, vencida o pendiente", async () => {
    await Clientes.crearActividad(id, { descripcion: "sin fecha" });
    await Clientes.crearActividad(id, { descripcion: "futura", fechaCompromiso: manana() });
    await Clientes.crearActividad(id, { descripcion: "hoy", fechaCompromiso: hoy() });
    await Clientes.crearActividad(id, { descripcion: "atrasada", fechaCompromiso: ayer() });
    await Clientes.crearActividad(id, { descripcion: "hecha", fechaCompromiso: ayer(), fechaFinalizacion: ayer() });

    const por = async (estado: "completada" | "vencida" | "pendiente") =>
      (await Clientes.buscarActividades({ estado })).map((a) => a.descripcion).sort();
    expect(await por("vencida")).toEqual(["atrasada"]);
    expect(await por("completada")).toEqual(["hecha"]);
    expect(await por("pendiente")).toEqual(["futura", "hoy", "sin fecha"]);
  });

  it("completar fija la fecha de ejecución y bloquea editar y borrar", async () => {
    const a = await Clientes.crearActividad(id, { descripcion: "Llamar" });
    const hecha = await Clientes.completarActividad(a.id, "2026-10-01");
    expect(hecha).toMatchObject({ fechaFinalizacion: "2026-10-01", estado: "completada" });
    await expect(Clientes.actualizarActividad(a.id, { descripcion: "otra" })).rejects.toThrow("completada");
    await expect(Clientes.eliminarActividad(a.id)).rejects.toThrow("completada");
    await expect(Clientes.completarActividad(a.id)).rejects.toThrow("completada");
  });

  it("edita y elimina actividades no completadas", async () => {
    const a = await Clientes.crearActividad(id, { descripcion: " Llamar " });
    expect(await Clientes.actualizarActividad(a.id, { fechaCompromiso: "2026-12-01" })).toMatchObject({
      descripcion: "Llamar", fechaCompromiso: "2026-12-01",
    });
    await Clientes.eliminarActividad(a.id);
    expect(await Clientes.buscarActividades({ id: a.id })).toHaveLength(0);
  });

  it("rechaza fechas inválidas y filtra por rango y texto", async () => {
    await expect(Clientes.crearActividad(id, { descripcion: "x", fechaCompromiso: "10/12/2026" })).rejects.toThrow("Fecha inválida");
    await Clientes.crearActividad(id, { descripcion: "Enviar presupuesto", fechaCompromiso: "2026-11-05" });
    await Clientes.crearActividad(id, { descripcion: "Reunión", fechaCompromiso: "2026-12-05" });
    expect(await Clientes.buscarActividades({ compromisoDesde: "2026-12-01" })).toHaveLength(1);
    expect(await Clientes.buscarActividades({ descripcion: "presupuesto", clienteId: id })).toHaveLength(1);
  });
});

describe("seed", () => {
  it("no duplica datos al repetirse", async () => {
    await seed(Clientes.db);
    await seed(Clientes.db);
    expect(await Clientes.buscar()).toHaveLength(10);
    const total = seedData.reduce((s, c) => s + c.actividades.length, 0);
    expect(await Clientes.buscarActividades()).toHaveLength(total);
  });
});
