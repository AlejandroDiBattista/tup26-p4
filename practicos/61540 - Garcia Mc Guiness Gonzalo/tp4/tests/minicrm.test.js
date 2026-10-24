const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.DATABASE_URL = ":memory:";

const { sqlite } = require("../src/db");
const { migrar } = require("../src/db/migrar");
const app = require("../src/app");

migrar();

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  sqlite.close();
});

beforeEach(() => {
  sqlite.exec("DELETE FROM clientes");
});

async function solicitar(ruta, metodo = "GET", datos) {
  const response = await fetch(`${baseUrl}${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: datos === undefined ? undefined : JSON.stringify(datos),
  });
  const body = response.status === 204 ? null : await response.json();
  return { body, response };
}

async function crearCliente(datos = {}) {
  const { body, response } = await solicitar("/api/clientes", "POST", {
    nombre: "Ana Pérez",
    email: "ana@example.com",
    telefono: "555-0101",
    direccion: "Calle 7",
    ...datos,
  });
  assert.equal(response.status, 201);
  return body;
}

test("gestiona clientes, busca por todos los campos y elimina en cascada", async () => {
  const cliente = await crearCliente();

  for (const termino of ["ANA", "EXAMPLE", "555-0101", "CALLE 7"]) {
    const { body, response } = await solicitar(
      `/api/clientes?busqueda=${encodeURIComponent(termino)}`,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(body.map((item) => item.id), [cliente.id]);
  }

  const wildcard = await solicitar("/api/clientes?busqueda=%25");
  assert.equal(wildcard.response.status, 200);
  assert.equal(wildcard.body.length, 0);

  const actualizacion = await solicitar(
    `/api/clientes/${cliente.id}`,
    "PUT",
    { nombre: "Ana García", telefono: null },
  );
  assert.equal(actualizacion.response.status, 200);
  assert.equal(actualizacion.body.nombre, "Ana García");
  assert.equal(actualizacion.body.telefono, null);

  const actividad = await solicitar(
    `/api/clientes/${cliente.id}/actividades`,
    "POST",
    { descripcion: "Revisar propuesta" },
  );
  assert.equal(actividad.response.status, 201);

  const eliminacion = await solicitar(
    `/api/clientes/${cliente.id}`,
    "DELETE",
  );
  assert.equal(eliminacion.response.status, 204);
  assert.equal(
    sqlite.prepare("SELECT count(*) AS cantidad FROM actividades").get()
      .cantidad,
    0,
  );

  const inexistente = await solicitar(`/api/clientes/${cliente.id}`);
  assert.equal(inexistente.response.status, 404);
});

test("valida los datos de cliente y rechaza búsquedas inválidas", async () => {
  for (const datos of [
    { nombre: " " },
    { nombre: "Ana", email: "no-es-un-correo" },
    { nombre: "Ana", admin: true },
  ]) {
    const { response } = await solicitar("/api/clientes", "POST", datos);
    assert.equal(response.status, 400);
  }

  const busquedaDuplicada = await solicitar(
    "/api/clientes?busqueda=ana&busqueda=perez",
  );
  assert.equal(busquedaDuplicada.response.status, 400);

  const jsonInvalido = await fetch(`${baseUrl}/api/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(jsonInvalido.status, 400);
});

test("gestiona actividades y protege las que ya están completadas", async () => {
  const cliente = await crearCliente();

  const actividadInvalida = await solicitar(
    `/api/clientes/${cliente.id}/actividades`,
    "POST",
    { descripcion: "", fecha: "2026-02-30" },
  );
  assert.equal(actividadInvalida.response.status, 400);

  const creada = await solicitar(
    `/api/clientes/${cliente.id}/actividades`,
    "POST",
    { descripcion: "Llamar al cliente", fecha: "2026-10-24" },
  );
  assert.equal(creada.response.status, 201);
  const actividad = creada.body;

  const actualizada = await solicitar(
    `/api/actividades/${actividad.id}`,
    "PUT",
    { descripcion: "Enviar un correo", fecha: null },
  );
  assert.equal(actualizada.response.status, 200);
  assert.equal(actualizada.body.descripcion, "Enviar un correo");
  assert.equal(actualizada.body.fecha, null);

  const completada = await solicitar(
    `/api/actividades/${actividad.id}/completar`,
    "PATCH",
  );
  assert.equal(completada.response.status, 200);
  assert.equal(completada.body.completada, true);
  assert.ok(completada.body.fechaCompletada);

  const actualizarCompletada = await solicitar(
    `/api/actividades/${actividad.id}`,
    "PUT",
    { descripcion: "No se debe guardar" },
  );
  assert.equal(actualizarCompletada.response.status, 409);

  const eliminarCompletada = await solicitar(
    `/api/actividades/${actividad.id}`,
    "DELETE",
  );
  assert.equal(eliminarCompletada.response.status, 409);

  const completarNuevamente = await solicitar(
    `/api/actividades/${actividad.id}/completar`,
    "PATCH",
  );
  assert.equal(completarNuevamente.response.status, 409);

  const pendiente = await solicitar(
    `/api/clientes/${cliente.id}/actividades`,
    "POST",
    { descripcion: "Actividad para eliminar" },
  );
  const eliminada = await solicitar(
    `/api/actividades/${pendiente.body.id}`,
    "DELETE",
  );
  assert.equal(eliminada.response.status, 204);

  const lista = await solicitar(
    `/api/clientes/${cliente.id}/actividades`,
  );
  assert.equal(lista.response.status, 200);
  assert.equal(lista.body.length, 1);
  assert.equal(lista.body[0].completada, true);
});

test("responde con error claro para una actividad o ruta inexistente", async () => {
  const actividad = await solicitar("/api/actividades/999999/completar", "PATCH");
  assert.equal(actividad.response.status, 404);
  assert.equal(typeof actividad.body.error, "string");

  const ruta = await solicitar("/api/ruta-inexistente");
  assert.equal(ruta.response.status, 404);
});

test("sirve la interfaz en la raíz con las versiones CDN fijadas", async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /react@18\.3\.1/);
  assert.match(html, /react-dom@18\.3\.1/);
  assert.match(html, /@babel\/standalone@7\.26\.10/);
  assert.match(html, /ReactDOM\.createRoot/);
});
