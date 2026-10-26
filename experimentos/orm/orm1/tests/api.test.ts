import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

let baseUrl: string;
let cerrarServidor: (() => Promise<void>) | undefined;
let directorioTemporal: string;

before(async () => {
  directorioTemporal = await mkdtemp(join(tmpdir(), "minicrm-api-test-"));
  process.env.TURSO_DATABASE_URL = `file:${join(directorioTemporal, "pruebas.db")}`;

  const [{ app }, { db }, { migrate }] = await Promise.all([
    import("../src/app.js"),
    import("../src/db/index.js"),
    import("drizzle-orm/libsql/migrator"),
  ]);

  await migrate(db, { migrationsFolder: "./drizzle" });

  const servidor = app.listen(0);
  await new Promise<void>((resolve) => servidor.once("listening", resolve));
  const direccion = servidor.address();
  assert.ok(direccion && typeof direccion !== "string");
  baseUrl = `http://127.0.0.1:${direccion.port}/api`;
  cerrarServidor = () => new Promise((resolve, reject) => {
    servidor.close((error) => error ? reject(error) : resolve());
  });
});

after(async () => {
  await cerrarServidor?.();
  if (directorioTemporal) await rm(directorioTemporal, { recursive: true, force: true });
});

test("API REST de clientes y actividades", async () => {
  const clienteCreado = await fetch(`${baseUrl}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "Ada",
      apellido: "Lovelace",
      email: "ada@ejemplo.com",
    }),
  });
  assert.equal(clienteCreado.status, 201);
  const cliente = await clienteCreado.json() as { id: number; nombre: string };
  assert.equal(cliente.nombre, "Ada");

  const busqueda = await fetch(`${baseUrl}/clientes/buscar?termino=ada`);
  assert.equal(busqueda.status, 200);
  assert.equal((await busqueda.json() as unknown[]).length, 1);

  const actividadCreada = await fetch(`${baseUrl}/actividades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clienteId: cliente.id,
      descripcion: "Enviar propuesta",
      fecha: "2020-01-01T00:00:00.000Z",
    }),
  });
  assert.equal(actividadCreada.status, 201);
  const actividad = await actividadCreada.json() as { id: number; estado: string };
  assert.equal(actividad.estado, "pendiente");

  const pendientes = await fetch(`${baseUrl}/actividades?estado=pendiente`);
  assert.equal((await pendientes.json() as unknown[]).length, 1);

  const vencidas = await fetch(`${baseUrl}/actividades?estado=vencida`);
  assert.equal((await vencidas.json() as unknown[]).length, 1);

  const actividadActualizada = await fetch(`${baseUrl}/actividades/${actividad.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: "completa" }),
  });
  assert.equal(actividadActualizada.status, 200);

  const completadas = await fetch(`${baseUrl}/actividades?estado=completa`);
  assert.equal((await completadas.json() as unknown[]).length, 1);

  const clienteEliminado = await fetch(`${baseUrl}/clientes/${cliente.id}`, { method: "DELETE" });
  assert.equal(clienteEliminado.status, 200);

  const actividadesRestantes = await fetch(`${baseUrl}/actividades?clienteId=${cliente.id}`);
  assert.deepEqual(await actividadesRestantes.json(), []);
});
