import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { Clientes } from "../src/clientes/clientes.js";
import { createDb } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { seed } from "../src/db/seed.js";

let server: Server;
let base: string;

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://localhost:${(server.address() as AddressInfo).port}/api/clientes`;
});
afterAll(() => void server.close());

beforeEach(async () => {
  const db = createDb(":memory:");
  await runMigrations(db);
  Clientes.conectar(db);
  await seed(db);
});

async function http(method: string, path = "", body?: unknown) {
  const res = await fetch(base + path, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined };
}

describe("/api/clientes", () => {
  it("lista y filtra", async () => {
    expect((await http("GET")).body).toHaveLength(10);
    const r = await http("GET", "?localidad=rosario");
    expect(r.body).toHaveLength(1);
    expect(r.body[0].actividades[0]).toHaveProperty("estado");
  });

  it("crea (201), normaliza y rechaza duplicados (409) e inválidos (400)", async () => {
    const nuevo = { nombre: "ana  paz", apellido: "x", email: "ANA@x.com", actividades: [{ descripcion: "Llamar" }] };
    const r = await http("POST", "", nuevo);
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ nombre: "Ana Paz", email: "ana@x.com", actividades: [{ descripcion: "Llamar" }] });
    expect((await http("POST", "", nuevo)).status).toBe(409);
    expect((await http("POST", "", { nombre: "a" })).status).toBe(400);
    expect((await http("POST", "", "{mal")).status).toBe(400);
  });

  it("obtiene, actualiza y elimina", async () => {
    const [{ id }] = (await http("GET", "?apellido=gómez")).body;
    expect((await http("GET", `/${id}`)).body.apellido).toBe("Gómez");
    expect((await http("PATCH", `/${id}`, { telefono: "(11) 4444-5555" })).body.telefono).toBe("1144445555");
    expect((await http("DELETE", `/${id}`)).status).toBe(204);
    expect((await http("GET", `/${id}`)).status).toBe(404);
    expect((await http("GET", "/abc")).status).toBe(400);
  });

  it("devuelve 404 JSON para rutas desconocidas", async () => {
    expect((await http("GET", "/1/otra")).status).toBe(404);
  });
});

describe("/api/clientes/:clienteId/actividades", () => {
  const rutas = async () => {
    const [c] = (await http("GET", "?email=lucia")).body;
    return { clienteId: c.id as number, base: `/${c.id}/actividades` };
  };

  it("lista, filtra por estado y valida el filtro", async () => {
    const { base } = await rutas();
    expect((await http("GET", base)).body).toHaveLength(2);
    const vencidas = (await http("GET", `${base}?estado=vencida`)).body;
    expect(vencidas).toHaveLength(1);
    expect((await http("GET", `${base}?estado=otro`)).status).toBe(400);
    expect((await http("GET", "/999/actividades")).status).toBe(404);
  });

  it("crea, edita, completa y bloquea cambios sobre completadas", async () => {
    const { base } = await rutas();
    const creada = await http("POST", base, { descripcion: "Nueva", fechaCompromiso: "2030-01-01" });
    expect(creada.status).toBe(201);
    const url = `${base}/${creada.body.id}`;

    expect((await http("PATCH", url, { descripcion: "Editada" })).body.descripcion).toBe("Editada");
    const hecha = await http("POST", `${url}/completar`, { fecha: "2026-10-01" });
    expect(hecha.body).toMatchObject({ estado: "completada", fechaFinalizacion: "2026-10-01" });

    expect((await http("PATCH", url, { descripcion: "x" })).status).toBe(409);
    expect((await http("DELETE", url)).status).toBe(409);
    expect((await http("POST", `${url}/completar`)).status).toBe(409);
  });

  it("completa con la fecha de hoy por defecto y elimina pendientes", async () => {
    const { base } = await rutas();
    const { body: pend } = await http("POST", base, { descripcion: "Otra" });
    expect((await http("POST", `${base}/${pend.id}/completar`)).body.estado).toBe("completada");
    const { body: otra } = await http("POST", base, { descripcion: "Borrable" });
    expect((await http("DELETE", `${base}/${otra.id}`)).status).toBe(204);
    expect((await http("GET", `${base}/${otra.id}`)).status).toBe(404);
  });

  it("no permite acceder a actividades de otro cliente", async () => {
    const { base } = await rutas();
    const [ajeno] = (await http("GET", "?email=martin")).body;
    const idAjeno = ajeno.actividades[0].id;
    expect((await http("GET", `${base}/${idAjeno}`)).status).toBe(404);
    expect((await http("POST", `${base}/${idAjeno}/completar`)).status).toBe(404);
  });
});
