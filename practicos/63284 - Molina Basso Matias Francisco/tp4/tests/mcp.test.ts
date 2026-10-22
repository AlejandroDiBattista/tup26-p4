import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { migrate } from "drizzle-orm/libsql/migrator";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = ":memory:";
const { app } = await import("../src/app.js");
const { db, client: database } = await import("../src/db/index.js");
let http: Server;
let base: string;
const mcp = new Client({ name: "minicrm-test", version: "1.0.0" });

before(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
  await new Promise<void>((resolve) => {
    http = app.listen(0, "127.0.0.1", resolve);
  });
  const address = http.address();
  assert.ok(address && typeof address !== "string");
  base = `http://127.0.0.1:${address.port}`;
  await mcp.connect(new StreamableHTTPClientTransport(new URL(base + "/mcp")));
});
after(async () => {
  await mcp.close();
  await new Promise<void>((resolve, reject) =>
    http.close((error) => (error ? reject(error) : resolve())),
  );
  database.close();
});

async function call(name: string, args: Record<string, unknown> = {}) {
  return (await mcp.callTool({ name, arguments: args })) as CallToolResult;
}
function text(result: CallToolResult) {
  return result.content
    .map((item) => (item.type === "text" ? item.text : ""))
    .join("\n");
}
async function ok(name: string, args: Record<string, unknown> = {}) {
  const result = await call(name, args);
  assert.ok(!result.isError, text(result));
  return JSON.parse(text(result));
}
async function error(
  name: string,
  args: Record<string, unknown>,
  message: RegExp,
) {
  const result = await call(name, args);
  assert.equal(result.isError, true);
  assert.match(text(result), message);
}
async function rest(path: string, method = "GET", body?: unknown) {
  const response = await fetch(base + "/api/clientes" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: response.status,
    data: response.status === 204 ? null : await response.json(),
  };
}
const datos = {
  nombre: "  ana ",
  apellido: "garcía",
  email: " ANA@EXAMPLE.COM ",
  telefono: "+54 (381) 555-0123",
  domicilio: "San Martín 123",
  localidad: "Yerba Buena",
};

test("MCP: inicialización real, descubrimiento de las 11 herramientas y transporte HTTP", async () => {
  assert.equal(mcp.getServerVersion()?.name, "minicrm");
  const { tools } = await mcp.listTools();
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    [
      "listar_clientes",
      "obtener_cliente",
      "agregar_cliente",
      "editar_cliente",
      "eliminar_cliente",
      "listar_actividades",
      "obtener_actividad",
      "agregar_actividad",
      "editar_actividad",
      "eliminar_actividad",
      "completar_actividad",
    ].sort(),
  );
  for (const tool of tools) assert.equal(tool.inputSchema.type, "object");
  for (const method of ["GET", "DELETE"]) {
    const response = await fetch(base + "/mcp", { method });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST");
  }
  const invalid = await fetch(base + "/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "metodo_inexistente",
    }),
  });
  assert.ok((await invalid.json()).error);
  const foreignOrigin = await fetch(base + "/mcp", {
    method: "POST",
    headers: { Origin: "https://otro.example" },
  });
  assert.equal(foreignOrigin.status, 403);
  assert.match(
    (await foreignOrigin.json()).error.message,
    /Origen no permitido/,
  );
});

test("MCP y REST: CRUD de clientes y búsqueda por todos los campos sobre los mismos datos", async () => {
  const cliente = await ok("agregar_cliente", { datos });
  const clienteId = cliente.id;
  assert.equal(cliente.nombre, "Ana");
  assert.equal(cliente.email, "ana@example.com");
  assert.equal(cliente.telefono, "+543815550123");
  assert.equal((await rest(`/${clienteId}`)).data.id, clienteId);
  for (const busqueda of [
    String(clienteId),
    "ana",
    "garcia",
    "ana@example.com",
    "543815550123",
    "san martin",
    "yerba buena",
    "garcia yerba",
  ]) {
    assert.ok(
      (await ok("listar_clientes", { busqueda })).some(
        (c: { id: number }) => c.id === clienteId,
      ),
    );
  }
  await ok("editar_cliente", {
    clienteId,
    datos: { ...datos, nombre: "Elena" },
  });
  assert.equal((await rest(`/${clienteId}`)).data.nombre, "Elena");
  assert.equal(
    (await rest(`/${clienteId}`, "PUT", { ...datos, nombre: "Julia" })).status,
    200,
  );
  assert.equal((await ok("obtener_cliente", { clienteId })).nombre, "Julia");
  await ok("eliminar_cliente", { clienteId });
  assert.equal((await rest(`/${clienteId}`)).status, 404);
  await error("obtener_cliente", { clienteId }, /Cliente no encontrado/);
  const creadoRest = await rest("", "POST", {
    ...datos,
    email: "rest@example.com",
  });
  assert.equal(creadoRest.status, 201);
  assert.equal(
    (await ok("obtener_cliente", { clienteId: creadoRest.data.id })).id,
    creadoRest.data.id,
  );
  assert.equal((await rest(`/${creadoRest.data.id}`, "DELETE")).status, 204);
  await error(
    "obtener_cliente",
    { clienteId: creadoRest.data.id },
    /no encontrado/,
  );
});

test("MCP y REST: actividades, pertenencia, finalización y protección en ambos transportes", async () => {
  const { id: clienteId } = await ok("agregar_cliente", { datos });
  const { id: otroId } = await ok("agregar_cliente", {
    datos: { ...datos, email: "otro@example.com" },
  });
  const actividad = await ok("agregar_actividad", {
    clienteId,
    datos: { descripcion: "Llamar" },
  });
  const ids = { clienteId, actividadId: actividad.id };
  const path = `/${clienteId}/actividades/${actividad.id}`;
  assert.equal(actividad.fechaCompromiso, null);
  assert.equal((await rest(`/${clienteId}/actividades`)).data.length, 1);
  assert.equal((await ok("listar_actividades", { clienteId })).length, 1);
  assert.equal((await ok("obtener_actividad", ids)).descripcion, "Llamar");
  for (const tool of [
    "obtener_actividad",
    "editar_actividad",
    "eliminar_actividad",
    "completar_actividad",
  ]) {
    await error(
      tool,
      {
        ...ids,
        clienteId: otroId,
        ...(tool === "editar_actividad"
          ? { datos: { descripcion: "No" } }
          : {}),
      },
      /Actividad no encontrada/,
    );
  }
  await ok("editar_actividad", {
    ...ids,
    datos: { descripcion: "Reunión", fechaCompromiso: "2026-12-01" },
  });
  assert.equal((await rest(path)).data.fechaCompromiso, "2026-12-01");
  assert.equal(
    (await rest(path, "PUT", { descripcion: "Desde REST" })).status,
    200,
  );
  assert.equal((await ok("obtener_actividad", ids)).descripcion, "Desde REST");
  const completed = await ok("completar_actividad", ids);
  assert.equal(completed.completada, true);
  assert.ok(completed.fechaFinalizacion);
  await error(
    "editar_actividad",
    { ...ids, datos: { descripcion: "No" } },
    /solo lectura/,
  );
  await error("eliminar_actividad", ids, /solo lectura/);
  await error("completar_actividad", ids, /solo lectura/);
  assert.equal((await rest(path, "PUT", { descripcion: "No" })).status, 409);
  assert.equal((await rest(path, "DELETE")).status, 409);
  const fromRest = await rest(`/${clienteId}/actividades`, "POST", {
    descripcion: "Otra",
  });
  assert.equal(fromRest.status, 201);
  const restPath = `/${clienteId}/actividades/${fromRest.data.id}`;
  assert.equal((await rest(restPath + "/completar", "PATCH")).status, 200);
  await error(
    "eliminar_actividad",
    { clienteId, actividadId: fromRest.data.id },
    /solo lectura/,
  );
  const pending = await ok("agregar_actividad", {
    clienteId,
    datos: { descripcion: "Borrar" },
  });
  await ok("eliminar_actividad", { clienteId, actividadId: pending.id });
  assert.equal(
    (await rest(`/${clienteId}/actividades/${pending.id}`)).status,
    404,
  );
  const pendingRest = await ok("agregar_actividad", {
    clienteId,
    datos: { descripcion: "Borrar REST" },
  });
  assert.equal(
    (await rest(`/${clienteId}/actividades/${pendingRest.id}`, "DELETE"))
      .status,
    204,
  );
  await error(
    "obtener_actividad",
    { clienteId, actividadId: pendingRest.id },
    /no encontrada/,
  );
  await ok("eliminar_cliente", { clienteId });
  await error("obtener_actividad", ids, /no encontrada/);
  await ok("eliminar_cliente", { clienteId: otroId });
});

test("MCP: errores de validación y registros inexistentes", async () => {
  await error("obtener_cliente", { clienteId: -1 }, /clienteId/);
  await error(
    "agregar_cliente",
    { datos: { nombre: "Ana" } },
    /apellido|email/,
  );
  await error(
    "agregar_cliente",
    { datos: { ...datos, email: "invalido" } },
    /email/,
  );
  await error(
    "agregar_actividad",
    { clienteId: 999999, datos: { descripcion: "" } },
    /descripcion/,
  );
  await error(
    "agregar_actividad",
    {
      clienteId: 999999,
      datos: { descripcion: "Hola", fechaCompromiso: "2026-02-30" },
    },
    /fechaCompromiso/,
  );
  await error(
    "agregar_actividad",
    { clienteId: 999999, datos: { descripcion: "Hola" } },
    /Cliente no encontrado/,
  );
  await error(
    "listar_actividades",
    { clienteId: 999999 },
    /Cliente no encontrado/,
  );
  await error(
    "eliminar_cliente",
    { clienteId: 999999 },
    /Cliente no encontrado/,
  );
});

test("Las dos páginas HTML se sirven sin cambios y Modern Light sigue usando REST", async () => {
  for (const file of ["MiniCRM.html", "microcrm.html"]) {
    const response = await fetch(base + "/" + file);
    assert.equal(response.status, 200);
    assert.equal(
      await response.text(),
      await readFile("public/" + file, "utf8"),
    );
  }
  const html = await readFile("public/microcrm.html", "utf8");
  assert.match(html, /fetch\("\/api\/clientes"/);
  assert.match(html, /runtime: "classic"/);
  assert.match(html, /#2563eb/);
  assert.doesNotMatch(html, /fetch\("\/mcp"/);
});

test("Adaptador embebido: CRUD MCP, intercambio REST, errores y cancelación de búsqueda", async () => {
  const html = await readFile("public/microcrm.html", "utf8");
  const script = html.match(
    /<script id="mcp-module">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(script);
  // El SDK solo no basta: el CDN debe fijar también su dependencia Zod.
  const imports = [...script.matchAll(/import\(\s*"(https:[^"]+)"\s*\)/g)].map(
    (match) => match[1],
  );
  assert.equal(imports.length, 2);
  for (const url of imports) {
    assert.match(url, /@modelcontextprotocol\/sdk@1\.32\.1\//);
    assert.equal(new URL(url).searchParams.get("deps"), "zod@4.1.12");
  }
  const scope = { window: {} as any, URL, location: { href: base } };
  runInNewContext(script, scope);
  const adapter = scope.window.crearClienteMcp({
    cargarSdk: async () => [{ Client }, { StreamableHTTPClientTransport }],
  });
  try {
    const created = await rest("", "POST", datos);
    const id = created.data.id;
    assert.ok(
      (await adapter.clientes.listar("garcia")).some((c: any) => c.id === id),
    );
    await adapter.clientes.guardar(id, { ...datos, nombre: "Cambio MCP" });
    assert.equal((await rest(`/${id}`)).data.nombre, "Cambio Mcp");
    const activity = await adapter.actividades.guardar(id, null, {
      descripcion: "Desde navegador",
    });
    assert.equal((await rest(`/${id}/actividades`)).data[0].id, activity.id);
    await adapter.actividades.guardar(id, activity.id, {
      descripcion: "Editada",
      fechaCompromiso: "2026-12-01",
    });
    assert.equal(
      (await adapter.actividades.obtener(id, activity.id)).descripcion,
      "Editada",
    );
    assert.equal((await adapter.actividades.listar(id)).length, 1);
    await adapter.actividades.completar(id, activity.id);
    assert.equal(
      (await rest(`/${id}/actividades/${activity.id}`)).data.completada,
      true,
    );
    assert.equal(
      (await adapter.clientes.obtener(id)).actividades[0].completada,
      true,
    );
    await assert.rejects(
      adapter.actividades.eliminar(id, activity.id),
      /solo lectura/,
    );
    await assert.rejects(
      adapter.actividades.guardar(id, activity.id, { descripcion: "No" }),
      /solo lectura/,
    );
    const pending = await adapter.actividades.guardar(id, null, {
      descripcion: "Eliminar",
    });
    await adapter.actividades.eliminar(id, pending.id);
    await assert.rejects(
      adapter.actividades.obtener(id, pending.id),
      /no encontrada/,
    );
    const other = await adapter.clientes.guardar(null, {
      ...datos,
      email: "adapter@example.com",
    });
    await adapter.clientes.eliminar(other.id);
    await adapter.clientes.eliminar(id);
    assert.equal((await rest(`/${id}`)).status, 404);
    await assert.rejects(
      adapter.clientes.guardar(null, { nombre: "Falta email" }),
      /email|apellido/,
    );
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(adapter.clientes.listar("", controller.signal), {
      name: "AbortError",
    });
  } finally {
    await adapter.cerrar();
  }
});
