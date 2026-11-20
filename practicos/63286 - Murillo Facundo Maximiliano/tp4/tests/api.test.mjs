import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { resolve } from "node:path";

process.env.TURSO_DATABASE_URL = "file::memory:";
delete process.env.TURSO_AUTH_TOKEN;

const [{ client, db }, { migrate }, { crearApp }] = await Promise.all([
  import("../dist/db/index.js"),
  import("drizzle-orm/libsql/migrator"),
  import("../dist/app.js"),
]);

let server;
let baseUrl;

before(async () => {
  await migrate(db, { migrationsFolder: resolve("drizzle") });
  server = crearApp().listen(0, "127.0.0.1");
  await new Promise((resolveListen, rejectListen) => {
    server.once("listening", resolveListen);
    server.once("error", rejectListen);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolveClose, rejectClose) => {
      server.close((error) => error ? rejectClose(error) : resolveClose());
    });
  }
  await client.close();
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...options.headers },
  });
  return { response, body: await response.json() };
}

test("sirve la interfaz y completa el ciclo de clientes y actividades por la API", async () => {
  const health = await request("/api/health");
  assert.equal(health.response.status, 200);
  assert.deepEqual(health.body.data, { status: "ok" });

  const page = await fetch(`${baseUrl}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /ReactDOM\.createRoot/);

  const invalidClient = await request("/api/clientes", {
    method: "POST",
    body: JSON.stringify({ nombre: "Incompleto" }),
  });
  assert.equal(invalidClient.response.status, 400);
  assert.equal(invalidClient.body.error.code, "VALIDACION");

  const created = await request("/api/clientes", {
    method: "POST",
    body: JSON.stringify({
      nombre: "  mARÍA ",
      apellido: " o'NEIL ",
      email: " QA.CHECK@EXAMPLE.COM ",
      telefono: "+54 (381) 555-0100",
    }),
  });
  assert.equal(created.response.status, 201);
  const customer = created.body.data;
  assert.equal(customer.nombre, "María");
  assert.equal(customer.apellido, "O'Neil");
  assert.equal(customer.email, "qa.check@example.com");
  assert.equal(customer.telefono, "+54 381 555 0100");

  const duplicate = await request("/api/clientes", {
    method: "POST",
    body: JSON.stringify({ nombre: "Otro", apellido: "Cliente", email: "qa.check@example.com" }),
  });
  assert.equal(duplicate.response.status, 409);

  const updated = await request(`/api/clientes/${customer.id}`, {
    method: "PATCH",
    body: JSON.stringify({ localidad: "Yerba Buena" }),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.localidad, "Yerba Buena");

  const createdActivity = await request(`/api/clientes/${customer.id}/actividades`, {
    method: "POST",
    body: JSON.stringify({ descripcion: "Revisar propuesta", fechaCompromiso: null }),
  });
  assert.equal(createdActivity.response.status, 201);
  const activity = createdActivity.body.data;
  assert.equal(activity.fechaCompromiso, null);

  const search = await request("/api/clientes?q=propuesta");
  assert(search.body.data.some((item) => item.id === customer.id));

  const detail = await request(`/api/clientes/${customer.id}`);
  assert.equal(detail.body.data.actividades.length, 1);

  const invalidDate = await request(`/api/actividades/${activity.id}`, {
    method: "PATCH",
    body: JSON.stringify({ fechaCompromiso: "2026-02-30" }),
  });
  assert.equal(invalidDate.response.status, 400);

  const editedActivity = await request(`/api/actividades/${activity.id}`, {
    method: "PATCH",
    body: JSON.stringify({ descripcion: "Propuesta revisada", fechaCompromiso: "2026-10-25" }),
  });
  assert.equal(editedActivity.response.status, 200);

  const completed = await request(`/api/actividades/${activity.id}/completar`, { method: "POST" });
  assert.equal(completed.response.status, 200);
  assert.match(completed.body.data.fechaFinalizacion, /^\d{4}-\d{2}-\d{2}$/);

  const editCompleted = await request(`/api/actividades/${activity.id}`, {
    method: "PATCH",
    body: JSON.stringify({ descripcion: "Cambio prohibido" }),
  });
  assert.equal(editCompleted.response.status, 409);

  const deleteCompleted = await request(`/api/actividades/${activity.id}`, { method: "DELETE" });
  assert.equal(deleteCompleted.response.status, 409);

  const pending = await request(`/api/clientes/${customer.id}/actividades`, {
    method: "POST",
    body: JSON.stringify({ descripcion: "Actividad para borrar", fechaCompromiso: null }),
  });
  assert.equal(pending.response.status, 201);
  const removePending = await request(`/api/actividades/${pending.body.data.id}`, { method: "DELETE" });
  assert.equal(removePending.response.status, 200);

  const removedCustomer = await request(`/api/clientes/${customer.id}`, { method: "DELETE" });
  assert.equal(removedCustomer.response.status, 200);
});
