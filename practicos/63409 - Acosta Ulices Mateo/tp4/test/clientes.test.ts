import "./setup.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Clientes, hoy } from "../src/services/clientes.js";
import { NoEncontrado, NoPermitido } from "../src/services/errores.js";

test("normaliza nombre, email y teléfono al crear", async () => {
  const c = await Clientes.crear({
    nombre: "  maría   josé ",
    apellido: "GÓMEZ",
    email: " Maria.Gomez@Mail.COM ",
    telefono: "(341) 555-0101",
    domicilio: "  ",
  });
  assert.equal(c.nombre, "María José");
  assert.equal(c.apellido, "Gómez");
  assert.equal(c.email, "maria.gomez@mail.com");
  assert.equal(c.telefono, "3415550101");
  assert.equal(c.domicilio, null);
});

test("busca por cualquier campo de forma parcial", async () => {
  await Clientes.crear({ nombre: "Ana", apellido: "Ruiz", email: "ana@x.com", localidad: "Rosario" });
  assert.equal((await Clientes.buscar({ localidad: "ros" })).length, 1);
  assert.equal((await Clientes.buscar({ nombre: "ANA", apellido: "ruiz" })).length, 1);
  assert.equal((await Clientes.buscar({ telefono: "555-01" })).length, 1);
  assert.equal((await Clientes.buscar({ localidad: "Salta" })).length, 0);
  assert.equal((await Clientes.buscar()).length, 2);
});

test("actualiza y borra un cliente con sus actividades", async () => {
  const c = await Clientes.crear({ nombre: "a", apellido: "b", email: "borrar@x.com" });
  const editado = await Clientes.actualizar(c.id, { telefono: "11 2222-3333" });
  assert.equal(editado.telefono, "1122223333");

  const a = await Clientes.agregarActividad(c.id, { descripcion: "Llamar" });
  await Clientes.completarActividad(c.id, a.id);
  await Clientes.borrar(c.id);
  await assert.rejects(Clientes.obtener(c.id), NoEncontrado);
  await assert.rejects(Clientes.borrar(c.id), NoEncontrado);
});

test("calcula el estado de las actividades", async () => {
  const c = await Clientes.crear({ nombre: "Eva", apellido: "Paz", email: "eva@x.com" });
  await Clientes.agregarActividad(c.id, { descripcion: "Sin fecha" });
  await Clientes.agregarActividad(c.id, { descripcion: "Vencida", fechaCompromiso: "2000-01-01" });
  await Clientes.agregarActividad(c.id, { descripcion: "Hoy", fechaCompromiso: hoy() });
  await Clientes.agregarActividad(c.id, { descripcion: "Hecha", fechaFinalizacion: "2000-01-02" });

  const estados = (await Clientes.listarActividades(c.id)).map((a) => a.estado);
  assert.deepEqual(estados, ["pendiente", "vencida", "pendiente", "completada"]);
});

test("edita y borra actividades pendientes, pero no completadas", async () => {
  const c = await Clientes.crear({ nombre: "Leo", apellido: "Sanz", email: "leo@x.com" });
  const a = await Clientes.agregarActividad(c.id, { descripcion: "Enviar mail" });

  const editada = await Clientes.actualizarActividad(c.id, a.id, { fechaCompromiso: "2030-01-01" });
  assert.equal(editada.fechaCompromiso, "2030-01-01");

  const completada = await Clientes.completarActividad(c.id, a.id);
  assert.equal(completada.fechaFinalizacion, hoy());
  await assert.rejects(Clientes.actualizarActividad(c.id, a.id, { descripcion: "Otra" }), NoPermitido);
  await assert.rejects(Clientes.borrarActividad(c.id, a.id), NoPermitido);

  const b = await Clientes.agregarActividad(c.id, { descripcion: "Borrar" });
  await Clientes.borrarActividad(c.id, b.id);
  assert.equal((await Clientes.listarActividades(c.id)).length, 1);
});

test("una actividad solo se modifica desde su cliente", async () => {
  const c1 = await Clientes.crear({ nombre: "Uno", apellido: "A", email: "uno@x.com" });
  const c2 = await Clientes.crear({ nombre: "Dos", apellido: "B", email: "dos@x.com" });
  const a = await Clientes.agregarActividad(c1.id, { descripcion: "De c1" });

  await assert.rejects(Clientes.borrarActividad(c2.id, a.id), NoEncontrado);
  await assert.rejects(Clientes.agregarActividad(999, { descripcion: "x" }), NoEncontrado);
});
