import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import { estadoActividad, fechaHoy } from "../src/services/estado-actividad.js";
import type { Actividad } from "../src/db/schema.js";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = ":memory:";
const { app } = await import("../src/app.js");
const { db, client } = await import("../src/db/index.js");
const { sembrarDemo } = await import("../src/db/seed-demo.js");
const { clientes, actividades } = await import("../src/db/schema.js");
const { Clientes } = await import("../src/services/clientes.js");
let server: Server;
let base: string;
before(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  client.close();
});
async function request(path: string, method = "GET", body?: unknown) {
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
test("CRUD, búsqueda por todos los campos y eliminación de actividades en cascada", async () => {
  const fields = {
    nombre: "Ana",
    apellido: "García",
    email: "ana@example.com",
    telefono: "3815550123",
    localidad: "Yerba Buena",
    domicilio: "San Martín 450, piso 100%",
  };
  const created = await request("", "POST", fields);
  assert.equal(created.status, 201);
  const id = created.data.id;
  for (const term of [...Object.values(fields), String(id), "ANA", "100%"]) {
    const result = await request("?q=" + encodeURIComponent(term));
    assert.ok(
      result.data.some((c: { id: number }) => c.id === id),
      term,
    );
  }
  assert.equal((await request("?q=xyz-inexistente")).data.length, 0);
  assert.equal(
    (await request("/" + id, "PUT", { ...fields, nombre: "Ana Pérez" })).data
      .nombre,
    "Ana Pérez",
  );
  const activity = await request(`/${id}/actividades`, "POST", {
    descripcion: "Llamar",
    fechaCompromiso: "2026-10-24",
  });
  assert.equal(activity.status, 201);
  assert.equal((await request("/" + id)).data.actividades.length, 1);
  assert.equal((await request("/" + id, "DELETE")).status, 204);
  assert.equal((await request("/" + id)).status, 404);
  const rows = await client.execute({
    sql: "SELECT * FROM actividades WHERE cliente_id = ?",
    args: [id],
  });
  assert.equal(rows.rows.length, 0);
});
test("actividades: editar pendientes, completar y proteger las completadas", async () => {
  const first = (
    await request("", "POST", {
      nombre: "Bruno",
      apellido: "López",
      email: "bruno@test.example",
    })
  ).data.id;
  const other = (
    await request("", "POST", {
      nombre: "Carla",
      apellido: "Pérez",
      email: "carla@test.example",
    })
  ).data.id;
  const activity = (
    await request(`/${first}/actividades`, "POST", {
      descripcion: "Reunión",
      fechaCompromiso: "2026-11-01",
    })
  ).data.id;
  assert.equal(
    (
      await request(`/${other}/actividades/${activity}`, "PUT", {
        descripcion: "Ajena",
        fechaCompromiso: "2026-11-02",
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request(`/${first}/actividades/${activity}`, "PUT", {
        descripcion: "Reunión inicial",
        fechaCompromiso: "2026-11-02",
      })
    ).status,
    200,
  );
  const completed = await request(
    `/${first}/actividades/${activity}/completar`,
    "PATCH",
  );
  assert.equal(completed.status, 200);
  assert.ok(Number.isFinite(Date.parse(completed.data.fechaFinalizacion)));
  assert.ok(
    Math.abs(Date.now() - Date.parse(completed.data.fechaFinalizacion)) < 5000,
  );
  assert.equal(
    (
      await request(`/${first}/actividades/${activity}`, "PUT", {
        descripcion: "Cambio",
        fechaCompromiso: "2026-11-03",
      })
    ).status,
    409,
  );
  assert.equal(
    (await request(`/${first}/actividades/${activity}/completar`, "PATCH"))
      .status,
    409,
  );
  assert.equal(
    (await request(`/${first}/actividades/${activity}`, "DELETE")).status,
    409,
  );
  assert.equal(
    (await request("/" + first)).data.actividades[0].descripcion,
    "Reunión inicial",
  );
});
test("validación y errores HTTP", async () => {
  for (const body of [
    {},
    { nombre: " " },
    { nombre: "Ana", email: "incorrecto" },
    { nombre: "Ana", id: 99 },
  ]) {
    assert.equal((await request("", "POST", body)).status, 400);
  }
  assert.equal((await request("/abc")).status, 400);
  assert.equal((await request("/999999")).status, 404);
  assert.equal((await request("?q=a&q=b")).status, 400);
  const id = (
    await request("", "POST", {
      nombre: "Validación",
      apellido: "Prueba",
      email: "validacion@test.example",
    })
  ).data.id;
  assert.equal(
    (
      await request(`/${id}/actividades`, "POST", {
        descripcion: "Llamar",
        fechaCompromiso: "2026-02-30",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/999999/actividades", "POST", {
        descripcion: "Llamar",
        fechaCompromiso: "2026-10-24",
      })
    ).status,
    404,
  );
  const malformed = await fetch(base + "/api/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(malformed.status, 400);
  assert.equal((await fetch(base + "/MiniCRM.html")).status, 200);
  const inicio = await fetch(base + "/", { redirect: "manual" });
  assert.equal(inicio.status, 302);
  assert.equal(inicio.headers.get("location"), "/microcrm.html");
  const pagina = await fetch(base + "/microcrm.html");
  assert.equal(pagina.status, 200);
  assert.match(pagina.headers.get("content-type") || "", /text\/html/);
});

test("campos obligatorios, compromiso opcional y finalización controlada por el servidor", async () => {
  const cliente = {
    nombre: "Lucía",
    apellido: "Prueba",
    email: "lucia@test.example",
  };
  for (const campo of ["nombre", "apellido", "email"] as const) {
    assert.equal(
      (await request("", "POST", { ...cliente, [campo]: "" })).status,
      400,
    );
  }
  const creado = await request("", "POST", cliente);
  assert.equal(creado.status, 201);
  assert.equal(creado.data.domicilio, null);
  assert.equal(creado.data.localidad, null);
  assert.equal(creado.data.telefono, null);
  const id = creado.data.id;
  for (const datos of [
    { descripcion: "Sin fecha" },
    { descripcion: "Fecha nula", fechaCompromiso: null },
  ]) {
    const actividad = await request(`/${id}/actividades`, "POST", datos);
    assert.equal(actividad.status, 201);
    assert.equal(actividad.data.fechaCompromiso, null);
    assert.equal(actividad.data.fechaFinalizacion, null);
    const ruta = `/${id}/actividades/${actividad.data.id}`;
    assert.equal(
      (
        await request(ruta, "PUT", {
          descripcion: datos.descripcion,
          fechaCompromiso: "2026-12-01",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request(ruta, "PUT", {
          descripcion: datos.descripcion,
          fechaCompromiso: null,
        })
      ).data.fechaCompromiso,
      null,
    );
    assert.equal(
      (
        await request(ruta, "PUT", {
          descripcion: datos.descripcion,
          fechaFinalizacion: "2026-01-01T00:00:00.000Z",
        })
      ).status,
      400,
    );
    const completada = await request(ruta + "/completar", "PATCH");
    assert.equal(completada.status, 200);
    assert.equal(completada.data.fechaCompromiso, null);
    assert.ok(completada.data.fechaFinalizacion);
    await request(ruta + "/completar", "PATCH");
    const ficha = await request("/" + id);
    assert.equal(
      ficha.data.actividades.find(
        (a: { id: number }) => a.id === actividad.data.id,
      ).fechaFinalizacion,
      completada.data.fechaFinalizacion,
    );
  }
  assert.equal(
    (
      await request(`/${id}/actividades`, "POST", {
        descripcion: "No completar al crear",
        fechaFinalizacion: "2026-01-01T00:00:00.000Z",
      })
    ).status,
    400,
  );
});

test("siembra idempotente: 10 clientes y 40 actividades, sin sobrescribir cambios", async () => {
  const clientesAntes = await db.select().from(clientes);
  const actividadesAntes = await db.select().from(actividades);
  await sembrarDemo();
  const primeraCarga = await db.query.clientes.findMany({
    with: { actividades: true },
  });
  const demo = primeraCarga.filter((c) => c.email.endsWith("@example.com"));
  assert.equal(demo.length, 10);
  assert.equal(primeraCarga.length, clientesAntes.length + 10);
  assert.equal(
    (await db.select().from(actividades)).length,
    actividadesAntes.length + 40,
  );
  for (const cliente of demo) {
    assert.equal(cliente.actividades.length, 4);
    assert.equal(
      cliente.actividades.filter((a) => a.fechaFinalizacion !== null).length,
      2,
    );
    assert.equal(
      cliente.actividades.filter((a) => a.fechaFinalizacion === null).length,
      2,
    );
    assert.equal(
      cliente.actividades.filter((a) => a.fechaCompromiso === null).length,
      2,
    );
  }
  const pendiente = demo[0].actividades.find(
    (a) => a.fechaFinalizacion === null,
  )!;
  await request(
    `/${demo[0].id}/actividades/${pendiente.id}/completar`,
    "PATCH",
  );
  const antesRepetir = await db.select().from(actividades);
  await sembrarDemo();
  await sembrarDemo();
  assert.deepEqual(await db.select().from(actividades), antesRepetir);
  assert.equal(
    (await db.select().from(clientes)).length,
    clientesAntes.length + 10,
  );
  assert.ok(
    (
      await db
        .select()
        .from(actividades)
        .where(eq(actividades.id, pendiente.id))
    )[0].fechaFinalizacion,
  );
});

test("normalización al crear y actualizar, búsqueda Unicode y combinada", async () => {
  const datos = {
    nombre: "  MARÍA   josé  ",
    apellido: "  díAZ  ",
    email: "  MARIA@TEST.EXAMPLE  ",
    telefono: " +54 (381) 555-0123 ",
    domicilio: " ",
    localidad: " Yerba   Buena ",
  };
  const cliente = await Clientes.crear(datos);
  assert.equal(cliente.nombre, "María José");
  assert.equal(cliente.apellido, "Díaz");
  assert.equal(cliente.email, "maria@test.example");
  assert.equal(cliente.telefono, "+543815550123");
  assert.equal(cliente.domicilio, null);
  assert.equal(cliente.localidad, "Yerba Buena");
  for (const busqueda of [
    "MARIA diaz",
    "jose YERBA",
    "+54381555",
    "MARIA@TEST.EXAMPLE",
    "DI\u0301AZ",
  ]) {
    assert.ok(
      (await Clientes.listar(busqueda)).some((c) => c.id === cliente.id),
      busqueda,
    );
  }
  assert.equal((await Clientes.listar("' OR 1=1 --")).length, 0);
  const actualizado = await Clientes.actualizar(cliente.id, {
    ...datos,
    nombre: "  ANA-MARÍA ",
    telefono: "(0381) 555.0123",
  });
  assert.equal(actualizado.nombre, "Ana-María");
  assert.equal(actualizado.telefono, "03815550123");
  assert.equal((await Clientes.obtener(cliente.id)).telefono, "03815550123");
  for (const telefono of [
    "abc3815550123",
    "++543815550123",
    "381+5550123",
    "123",
  ]) {
    assert.equal(
      (await request("", "POST", { ...datos, telefono })).status,
      400,
    );
  }
  const vacio = await Clientes.actualizar(cliente.id, {
    ...datos,
    telefono: " ",
  });
  assert.equal(vacio.telefono, null);
});

test("CRUD de actividades: listar, obtener y borrar pendientes, respetando pertenencia", async () => {
  const cliente = await Clientes.crear({
    nombre: "Prueba",
    apellido: "Actividades",
    email: "crud@test.example",
  });
  const otra = await Clientes.crear({
    nombre: "Otra",
    apellido: "Persona",
    email: "otra@test.example",
  });
  const pendiente = await Clientes.agregarActividad(cliente.id, {
    descripcion: "Borrable",
  });
  assert.equal(pendiente.completada, false);
  assert.equal(pendiente.vencida, false);
  const ruta = `/${cliente.id}/actividades/${pendiente.id}`;
  assert.equal((await request(`/${cliente.id}/actividades`)).data.length, 1);
  assert.equal((await request(ruta)).data.id, pendiente.id);
  assert.equal(
    (await request(`/${otra.id}/actividades/${pendiente.id}`)).status,
    404,
  );
  assert.equal(
    (await request(`/${otra.id}/actividades/${pendiente.id}`, "DELETE")).status,
    404,
  );
  assert.equal((await request(ruta, "DELETE")).status, 204);
  assert.equal((await request(ruta)).status, 404);
  assert.equal((await request(ruta, "DELETE")).status, 404);
  assert.equal((await request(`/${cliente.id}/actividades`)).data.length, 0);
  assert.equal((await request("/999999/actividades")).status, 404);
  const vencida = await Clientes.agregarActividad(cliente.id, {
    descripcion: "Compromiso pasado",
    fechaCompromiso: "2000-01-01",
  });
  assert.equal(vencida.vencida, true);
  assert.equal(
    (await request(`/${cliente.id}`)).data.actividades[0].vencida,
    true,
  );
  const completa = await Clientes.completarActividad(cliente.id, vencida.id);
  assert.equal(completa.completada, true);
  assert.equal(completa.vencida, false);
  await assert.rejects(Clientes.eliminarActividad(cliente.id, vencida.id), {
    status: 409,
  });
  await assert.rejects(
    Clientes.modificarActividad(cliente.id, vencida.id, {
      descripcion: "Cambio",
    }),
    { status: 409 },
  );
});

test("compromisos: sin fecha, vencidos ascendentes y actuales/futuros ascendentes", async () => {
  const cliente = await Clientes.crear({ nombre: "Orden", apellido: "Actividades", email: "orden@test.example" });
  const hoy = fechaHoy();
  const fechas = ["2999-12-31", "2001-01-01", null, hoy, "2000-01-01", "2999-01-01", null];
  for (const [indice, fechaCompromiso] of fechas.entries()) {
    await Clientes.agregarActividad(cliente.id, { descripcion: `Actividad ${indice}`, fechaCompromiso });
  }
  const completa = await Clientes.agregarActividad(cliente.id, { descripcion: "Completada", fechaCompromiso: null });
  await Clientes.completarActividad(cliente.id, completa.id);
  const lista = (await request(`/${cliente.id}/actividades`)).data;
  assert.deepEqual(lista.filter((a: { completada: boolean }) => !a.completada).map((a: { fechaCompromiso: string | null }) => a.fechaCompromiso),
    [null, null, "2000-01-01", "2001-01-01", hoy, "2999-01-01", "2999-12-31"]);
  assert.deepEqual(lista.map((a: { vencida: boolean }) => a.vencida), [false, false, true, true, false, false, false, false]);
  assert.equal(lista.at(-1).id, completa.id);
});

test("vencimiento: ayer, hoy, mañana, sin fecha y medianoche de Argentina", () => {
  assert.equal(fechaHoy(new Date("2026-10-21T02:59:59Z")), "2026-10-20");
  assert.equal(fechaHoy(new Date("2026-10-21T03:00:00Z")), "2026-10-21");
  const base: Actividad = {
    id: 1,
    clienteId: 1,
    descripcion: "Llamar",
    fechaCompromiso: null,
    fechaFinalizacion: null,
  };
  for (const [fechaCompromiso, vencida] of [
    ["2026-10-19", true],
    ["2026-10-20", false],
    ["2026-10-21", false],
    [null, false],
  ] as const) {
    assert.equal(
      estadoActividad({ ...base, fechaCompromiso }, "2026-10-20").vencida,
      vencida,
    );
    const completa = estadoActividad(
      { ...base, fechaCompromiso, fechaFinalizacion: "2026-10-19T15:00:00Z" },
      "2026-10-20",
    );
    assert.equal(completa.completada, true);
    assert.equal(completa.vencida, false);
  }
});
