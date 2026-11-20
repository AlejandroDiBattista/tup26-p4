import "./setup.js";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { app } from "../src/app.js";

// Levanta la API en un puerto libre y la prueba con fetch.
const servidor = app.listen(0);
const origen = `http://localhost:${(servidor.address() as AddressInfo).port}`;
const base = `${origen}/api/clientes`;
after(() => servidor.close());

test("sirve la página MicroCRM", async () => {
  const respuesta = await fetch(`${origen}/microcrm.html`);
  assert.equal(respuesta.status, 200);
  assert.match(respuesta.headers.get("content-type") ?? "", /text\/html/);
});

function pedir(ruta: string, method = "GET", body?: unknown) {
  return fetch(base + ruta, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("CRUD de clientes", async () => {
  const creado = await pedir("", "POST", { nombre: "ana", apellido: "ruiz", email: "Ana@X.com" });
  assert.equal(creado.status, 201);
  const cliente = await creado.json();
  assert.equal(cliente.nombre, "Ana");

  assert.equal((await pedir(`/${cliente.id}`)).status, 200);
  assert.equal((await (await pedir("?nombre=an")).json()).length, 1);

  const editado = await pedir(`/${cliente.id}`, "PATCH", { localidad: "Rosario" });
  assert.equal((await editado.json()).localidad, "Rosario");

  assert.equal((await pedir(`/${cliente.id}`, "DELETE")).status, 204);
  assert.equal((await pedir(`/${cliente.id}`)).status, 404);
});

test("datos inválidos devuelven 400", async () => {
  assert.equal((await pedir("", "POST", { nombre: "Sin email", apellido: "X" })).status, 400);
  await pedir("", "POST", { nombre: "A", apellido: "B", email: "rep@x.com" });
  const repetido = await pedir("", "POST", { nombre: "C", apellido: "D", email: "REP@x.com" });
  assert.equal(repetido.status, 400);
  assert.equal((await repetido.json()).error, "Ya existe un registro con ese email");
});

test("actividades de un cliente, incluso completarlas", async () => {
  const cliente = await (await pedir("", "POST", { nombre: "Leo", apellido: "Paz", email: "leo@x.com" })).json();
  const ruta = `/${cliente.id}/actividades`;

  const creada = await pedir(ruta, "POST", { descripcion: "Llamar", fechaCompromiso: "2000-01-01" });
  assert.equal(creada.status, 201);
  const actividad = await creada.json();

  const lista = await (await pedir(ruta)).json();
  assert.equal(lista[0].estado, "vencida");

  const editada = await pedir(`${ruta}/${actividad.id}`, "PATCH", { descripcion: "Llamar otra vez" });
  assert.equal((await editada.json()).descripcion, "Llamar otra vez");

  const completada = await pedir(`${ruta}/${actividad.id}/completar`, "POST");
  assert.equal(completada.status, 200);
  assert.ok((await completada.json()).fechaFinalizacion);

  assert.equal((await pedir(`${ruta}/${actividad.id}`, "PATCH", { descripcion: "x" })).status, 409);
  assert.equal((await pedir(`${ruta}/${actividad.id}`, "DELETE")).status, 409);
  assert.equal((await pedir("/999/actividades")).status, 404);
});
