import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/api/app.js";
import { ClienteRepository } from "../src/servicios/cliente-repository.js";
import { nuevaDb } from "./test-db.js";

const api = crearApp();

let secuencia = 0;
const email = () => `cliente${++secuencia}@example.com`;

/** Alta de cliente por la API; devuelve el body creado. */
async function altaCliente(datos: Record<string, unknown> = {}) {
  const respuesta = await request(api)
    .post("/api/clientes")
    .send({ nombre: "Ana", apellido: "Gómez", email: email(), ...datos });

  expect(respuesta.status).toBe(201);
  return respuesta.body;
}

/** Alta de actividad por la API; devuelve el body creado. */
async function altaActividad(clienteId: number, datos: Record<string, unknown> = {}) {
  const respuesta = await request(api)
    .post(`/api/clientes/${clienteId}/actividades`)
    .send({ descripcion: "Llamar al cliente", ...datos });

  expect(respuesta.status).toBe(201);
  return respuesta.body;
}

describe("API REST de clientes", () => {
  beforeEach(() => {
    ClienteRepository.configurar(nuevaDb());
  });

  it("crea un cliente normalizado y responde 201 con Location", async () => {
    const respuesta = await request(api).post("/api/clientes").send({
      nombre: "  ana   GÓMEZ ",
      apellido: "gomez",
      email: "  Ana.Gomez@Example.COM ",
      telefono: "+54 11 5555-1001",
    });

    expect(respuesta.status).toBe(201);
    expect(respuesta.headers.location).toBe(`/api/clientes/${respuesta.body.id}`);
    expect(respuesta.body).toMatchObject({
      nombre: "Ana Gómez",
      apellido: "Gomez",
      email: "ana.gomez@example.com",
      telefono: "+541155551001",
      domicilio: null,
    });
  });

  it("rechaza con 400 un cliente sin campos obligatorios", async () => {
    const respuesta = await request(api).post("/api/clientes").send({ nombre: "Ana", apellido: "Gómez" });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toMatch(/email/);
  });

  it("responde 409 si el email ya existe", async () => {
    const correo = email();
    await altaCliente({ email: correo });

    const respuesta = await request(api).post("/api/clientes").send({ nombre: "Otra", apellido: "Persona", email: correo });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.error).toMatch(/Ya existe/);
  });

  it("lista los clientes y busca por texto con ?buscar=", async () => {
    await altaCliente({ nombre: "Ana", apellido: "Gómez" });
    await altaCliente({ nombre: "Rosario", apellido: "Pérez", localidad: "Rosario" });

    const todos = await request(api).get("/api/clientes");
    expect(todos.status).toBe(200);
    expect(todos.body).toHaveLength(2);

    const filtrados = await request(api).get("/api/clientes").query({ buscar: "rosario" });
    expect(filtrados.body).toHaveLength(1);
    expect(filtrados.body[0].apellido).toBe("Pérez");
  });

  it("responde 200, 400 y 404 según el :clienteId", async () => {
    const cliente = await altaCliente();

    expect((await request(api).get(`/api/clientes/${cliente.id}`)).body).toMatchObject({ id: cliente.id });
    expect((await request(api).get("/api/clientes/9999")).status).toBe(404);
    expect((await request(api).get("/api/clientes/abc")).status).toBe(400);
  });

  it("actualiza parcialmente con PATCH y rechaza un body vacío", async () => {
    const cliente = await altaCliente();

    const respuesta = await request(api).patch(`/api/clientes/${cliente.id}`).send({ telefono: "+54 11 4444-2002" });
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({ id: cliente.id, telefono: "+541144442002", nombre: "Ana" });

    const vacio = await request(api).put(`/api/clientes/${cliente.id}`).send({});
    expect(vacio.status).toBe(400);

    const sinNombre = await request(api).patch(`/api/clientes/${cliente.id}`).send({ nombre: "   " });
    expect(sinNombre.status).toBe(400);
    expect(sinNombre.body.error).toMatch(/no puede quedar vacío/);

    expect((await request(api).patch("/api/clientes/9999").send({ nombre: "Nadie" })).status).toBe(404);
  });

  it("elimina el cliente con 204 y luego responde 404", async () => {
    const cliente = await altaCliente();

    expect((await request(api).delete(`/api/clientes/${cliente.id}`)).status).toBe(204);
    expect((await request(api).get(`/api/clientes/${cliente.id}`)).status).toBe(404);
    expect((await request(api).delete(`/api/clientes/${cliente.id}`)).status).toBe(404);
  });

  it("responde 404 con JSON en una ruta inexistente", async () => {
    const respuesta = await request(api).get("/api/otra-cosa");

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toMatch(/No existe la ruta/);
  });
});

describe("interfaz estática", () => {
  it("sirve la página en /MiniCRM.html", async () => {
    const respuesta = await request(api).get("/MiniCRM.html");

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers["content-type"]).toMatch(/text\/html/);
    expect(respuesta.text).toMatch(/id="raiz"/);
  });

  it("redirige la raíz hacia la página", async () => {
    const respuesta = await request(api).get("/");

    expect(respuesta.status).toBe(302);
    expect(respuesta.headers.location).toBe("/MiniCRM.html");
  });
});

describe("API REST de actividades (bajo /api/clientes/:clienteId)", () => {
  beforeEach(() => {
    ClienteRepository.configurar(nuevaDb());
  });

  it("crea una actividad pendiente y responde 201", async () => {
    const cliente = await altaCliente();

    const actividad = await altaActividad(cliente.id, { fechaCompromiso: "2026-03-01T00:00:00.000Z" });

    expect(actividad).toMatchObject({
      clienteId: cliente.id,
      descripcion: "Llamar al cliente",
      fechaFinalizacion: null,
    });
    expect(actividad.fechaCompromiso).toBe("2026-03-01T00:00:00.000Z");
  });

  it("valida el body y el cliente dueño", async () => {
    const cliente = await altaCliente();

    const sinDescripcion = await request(api).post(`/api/clientes/${cliente.id}/actividades`).send({});
    expect(sinDescripcion.status).toBe(400);

    const clienteInexistente = await request(api).post("/api/clientes/9999/actividades").send({ descripcion: "Algo" });
    expect(clienteInexistente.status).toBe(404);
  });

  it("lista las actividades del cliente y filtra por estado, texto y fechas", async () => {
    const cliente = await altaCliente();
    await altaActividad(cliente.id, { descripcion: "Vencida", fechaCompromiso: "2020-01-01T00:00:00.000Z" });
    await altaActividad(cliente.id, { descripcion: "Sin fecha" });

    const todas = await request(api).get(`/api/clientes/${cliente.id}/actividades`);
    expect(todas.status).toBe(200);
    expect(todas.body).toHaveLength(2);

    const vencidas = await request(api).get(`/api/clientes/${cliente.id}/actividades`).query({ estado: "vencida" });
    expect(vencidas.body.map((a: { descripcion: string }) => a.descripcion)).toEqual(["Vencida"]);

    const sinFecha = await request(api).get(`/api/clientes/${cliente.id}/actividades`).query({ sinFecha: "true" });
    expect(sinFecha.body).toHaveLength(1);

    const porTexto = await request(api).get(`/api/clientes/${cliente.id}/actividades`).query({ descripcion: "venc" });
    expect(porTexto.body).toHaveLength(1);

    const desde = await request(api).get(`/api/clientes/${cliente.id}/actividades`).query({ compromisoDesde: "2021-01-01" });
    expect(desde.body).toHaveLength(0);

    const estadoInvalido = await request(api).get(`/api/clientes/${cliente.id}/actividades`).query({ estado: "otro" });
    expect(estadoInvalido.status).toBe(400);
  });

  it("responde 404 si el cliente no existe o la actividad es de otro cliente", async () => {
    const cliente = await altaCliente();
    const otro = await altaCliente();
    const actividad = await altaActividad(cliente.id);

    expect((await request(api).get(`/api/clientes/9999/actividades`)).status).toBe(404);
    expect((await request(api).get(`/api/clientes/${otro.id}/actividades/${actividad.id}`)).status).toBe(404);
    expect((await request(api).delete(`/api/clientes/${otro.id}/actividades/${actividad.id}`)).status).toBe(404);
  });

  it("actualiza una actividad pendiente y la elimina con 204", async () => {
    const cliente = await altaCliente();
    const actividad = await altaActividad(cliente.id);

    const actualizada = await request(api)
      .patch(`/api/clientes/${cliente.id}/actividades/${actividad.id}`)
      .send({ descripcion: "Llamar dos veces", fechaCompromiso: null });
    expect(actualizada.status).toBe(200);
    expect(actualizada.body).toMatchObject({ descripcion: "Llamar dos veces", fechaCompromiso: null });

    expect((await request(api).delete(`/api/clientes/${cliente.id}/actividades/${actividad.id}`)).status).toBe(204);
    expect((await request(api).get(`/api/clientes/${cliente.id}/actividades/${actividad.id}`)).status).toBe(404);
  });

  it("completa una actividad y la deja inmodificable", async () => {
    const cliente = await altaCliente();
    const actividad = await altaActividad(cliente.id);

    const completada = await request(api)
      .post(`/api/clientes/${cliente.id}/actividades/${actividad.id}/completar`)
      .send({ fecha: "2026-02-10T12:00:00.000Z" });

    expect(completada.status).toBe(200);
    expect(completada.body.fechaFinalizacion).toBe("2026-02-10T12:00:00.000Z");

    // Idempotente: la fecha de finalización no se reescribe.
    const otraVez = await request(api).post(`/api/clientes/${cliente.id}/actividades/${actividad.id}/completar`);
    expect(otraVez.body.fechaFinalizacion).toBe("2026-02-10T12:00:00.000Z");

    const editar = await request(api)
      .patch(`/api/clientes/${cliente.id}/actividades/${actividad.id}`)
      .send({ descripcion: "Otra cosa" });
    expect(editar.status).toBe(409);
    expect(editar.body.error).toMatch(/completada/);

    expect((await request(api).delete(`/api/clientes/${cliente.id}/actividades/${actividad.id}`)).status).toBe(409);

    const filtroCompletadas = await request(api)
      .get(`/api/clientes/${cliente.id}/actividades`)
      .query({ estado: "completada" });
    expect(filtroCompletadas.body).toHaveLength(1);
  });

  it("completa una actividad sin fecha y responde 404 si no existe", async () => {
    const cliente = await altaCliente();
    const actividad = await altaActividad(cliente.id);

    const completada = await request(api).post(`/api/clientes/${cliente.id}/actividades/${actividad.id}/completar`);
    expect(completada.status).toBe(200);
    expect(completada.body.fechaFinalizacion).not.toBeNull();

    expect((await request(api).post(`/api/clientes/${cliente.id}/actividades/9999/completar`)).status).toBe(404);
  });
});
