import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { Clientes } from "../src/clientes/clientes.js";
import { createDb } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { seed } from "../src/db/seed.js";

let server: Server;
let client: Client;
let url: URL;

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  url = new URL(`http://localhost:${(server.address() as AddressInfo).port}/mcp`);
  client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(url));
});
afterAll(async () => {
  await client.close();
  server.close();
});

beforeEach(async () => {
  const db = createDb(":memory:");
  await runMigrations(db);
  Clientes.conectar(db);
  await seed(db);
});

type Resultado = { isError?: boolean; content: { type: string; text: string }[] };
async function llamar(name: string, args: Record<string, unknown> = {}) {
  const r = (await client.callTool({ name, arguments: args })) as Resultado;
  const text = r.content[0]!.text;
  return { error: !!r.isError, text, json: r.isError ? undefined : JSON.parse(text) };
}

describe("MCP /mcp", () => {
  it("expone las herramientas de clientes y actividades", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "actualizar_actividad", "actualizar_cliente", "buscar_actividades", "buscar_clientes",
      "completar_actividad", "crear_actividad", "crear_cliente", "eliminar_actividad",
      "eliminar_cliente", "obtener_cliente",
    ]);
    expect(tools.find((t) => t.name === "crear_actividad")?.inputSchema.required).toContain("clienteId");
  });

  it("busca clientes con el mismo servicio", async () => {
    expect((await llamar("buscar_clientes")).json).toHaveLength(10);
    expect((await llamar("buscar_clientes", { q: "rosario" })).json[0].apellido).toBe("Fernández");
  });

  it("crea con composición, normaliza y comparte datos con REST", async () => {
    const r = await llamar("crear_cliente", {
      nombre: " ana ", apellido: "paz", email: "ANA@X.com", actividades: [{ descripcion: "Llamar" }],
    });
    expect(r.json).toMatchObject({ nombre: "Ana", email: "ana@x.com", actividades: [{ descripcion: "Llamar" }] });
    expect(await Clientes.buscar({ email: "ana@x.com" })).toHaveLength(1);
  });

  it("devuelve errores claros: duplicado, inexistente y entrada inválida", async () => {
    const dup = await llamar("crear_cliente", { nombre: "A", apellido: "B", email: "martin.gomez@example.com" });
    expect(dup).toMatchObject({ error: true });
    expect(dup.text).toContain("Operación no permitida");
    expect((await llamar("obtener_cliente", { id: 999 })).text).toContain("No encontrado");
    expect((await llamar("crear_actividad", { clienteId: 1, descripcion: "x", fechaCompromiso: "10/12/2026" })).error).toBe(true);
    expect((await llamar("crear_cliente", { nombre: "A" })).error).toBe(true);
  });

  it("respeta las reglas de actividades completadas y la pertenencia al cliente", async () => {
    const act = (await llamar("crear_actividad", { clienteId: 1, descripcion: "Nueva" })).json;
    expect((await llamar("completar_actividad", { clienteId: 1, id: act.id, fecha: "2026-10-01" })).json).toMatchObject({
      estado: "completada", fechaFinalizacion: "2026-10-01",
    });
    for (const [tool, args] of [
      ["actualizar_actividad", { descripcion: "otra" }], ["eliminar_actividad", {}], ["completar_actividad", {}],
    ] as const) {
      const r = await llamar(tool, { clienteId: 1, id: act.id, ...args });
      expect(r.error).toBe(true);
      expect(r.text).toContain("completada");
    }
    expect((await llamar("eliminar_actividad", { clienteId: 2, id: act.id })).text).toContain("No encontrado");
    expect((await llamar("buscar_actividades", { clienteId: 1, estado: "completada" })).json.length).toBeGreaterThan(1);
  });

  it("eliminar un cliente elimina sus actividades", async () => {
    await llamar("eliminar_cliente", { id: 1 });
    expect((await llamar("buscar_actividades", { clienteId: 1 })).error).toBe(true);
    expect(await Clientes.buscarActividades({ clienteId: 1 })).toHaveLength(0);
  });

  it("rechaza GET con 405", async () => {
    expect((await fetch(url)).status).toBe(405);
  });
});
