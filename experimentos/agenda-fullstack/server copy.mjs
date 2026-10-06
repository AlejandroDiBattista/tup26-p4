/** Agenda mínima: Express → Drizzle → SQLite. Node.js 22 o posterior. */
import express from 'express';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, integer, text, index, check } from 'drizzle-orm/sqlite-core';
import { eq, and, or, exists, count, asc, sql } from 'drizzle-orm';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const carpeta = dirname(fileURLToPath(import.meta.url));
const tipos = ['telefono', 'celular', 'email'];

// 1. ESQUEMA. Un contacto tiene cero o muchas direcciones de comunicación.
export const contactos = sqliteTable('contactos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  domicilio: text('domicilio').notNull().default(''),
});
export const direcciones = sqliteTable('direcciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  contactoId: integer('contacto_id').notNull()
    .references(() => contactos.id, { onDelete: 'cascade' }),
  tipo: text('tipo', { enum: tipos }).notNull(),
  valor: text('valor').notNull(),
}, (t) => [
  index('direcciones_contacto_idx').on(t.contactoId),
  check('direcciones_tipo_check', sql`${t.tipo} in ('telefono', 'celular', 'email')`),
  check('direcciones_valor_check', sql`length(trim(${t.valor})) > 0`),
]);

// El esquema de Drizzle no crea tablas por sí solo. DDL inicial explícito para
// mantener un único archivo de servidor; NO sustituye migraciones evolutivas.
const ddl = [
  sql`CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    domicilio TEXT NOT NULL DEFAULT ''
  )`,
  sql`CREATE TABLE IF NOT EXISTS direcciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contacto_id INTEGER NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CONSTRAINT direcciones_tipo_check
      CHECK (tipo IN ('telefono', 'celular', 'email')),
    valor TEXT NOT NULL CONSTRAINT direcciones_valor_check
      CHECK (length(trim(valor)) > 0)
  )`,
  sql`CREATE INDEX IF NOT EXISTS direcciones_contacto_idx ON direcciones(contacto_id)`,
];

const errorHttp = (status, mensaje) => Object.assign(new Error(mensaje), { status });
const normalizar = (texto) => String(texto ?? '').normalize('NFD')
  .replace(/\p{M}/gu, '').toLowerCase();

// 2. VALIDACIÓN. El servidor no confía en los controles del navegador.
function validar(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo))
    throw errorHttp(400, 'Se esperaba un objeto JSON.');
  const campo = (valor, nombre, maximo, obligatorio = true) => {
    if (typeof valor !== 'string' || valor.trim().length > maximo ||
        (obligatorio && !valor.trim()))
      throw errorHttp(400, `${nombre}: texto ${obligatorio ? 'obligatorio ' : ''}de hasta ${maximo} caracteres.`);
    return valor.trim();
  };
  if (!Array.isArray(cuerpo.direcciones) || cuerpo.direcciones.length > 20)
    throw errorHttp(400, 'direcciones debe ser un arreglo de hasta 20 elementos.');
  return {
    nombre: campo(cuerpo.nombre, 'nombre', 80),
    apellido: campo(cuerpo.apellido, 'apellido', 80),
    domicilio: campo(cuerpo.domicilio, 'domicilio', 200, false),
    direcciones: cuerpo.direcciones.map((d, i) => {
      if (!d || !tipos.includes(d.tipo))
        throw errorHttp(400, `Dirección ${i + 1}: tipo inválido.`);
      const valor = campo(d.valor, `Dirección ${i + 1}`, 254);
      if (d.tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor))
        throw errorHttp(400, `Dirección ${i + 1}: email inválido.`);
      return { tipo: d.tipo, valor }; // Se ignoran IDs y campos no admitidos.
    }),
  };
}
function leerId(valor) {
  const id = Number(valor);
  if (!/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(id))
    throw errorHttp(400, 'El ID debe ser un entero positivo.');
  return id;
}

// La fábrica permite probar la API con una base temporal sin arrancar otro servidor.
export function crearAplicacion({ archivo = resolve(carpeta, 'agenda.db'), semilla = true,
  logSql = false, logHttp = true } = {}) {
  const nueva = archivo === ':memory:' || !existsSync(archivo);
  const sqlite = new Database(archivo);
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');
  // Función local: buscar "garcia" también encuentra "García".
  sqlite.function('normalizar', { deterministic: true }, normalizar);
  const db = drizzle(sqlite, { logger: logSql });
  db.transaction((tx) => { for (const sentencia of ddl) tx.run(sentencia); });

  // 3. PERSISTENCIA. Dos tablas se convierten en un único recurso JSON anidado.
  function leerContacto(id, tx = db) {
    const contacto = tx.select().from(contactos).where(eq(contactos.id, id)).get();
    if (!contacto) throw errorHttp(404, 'El contacto no existe.');
    const lista = tx.select({ tipo: direcciones.tipo, valor: direcciones.valor })
      .from(direcciones).where(eq(direcciones.contactoId, id))
      .orderBy(asc(direcciones.id)).all();
    return { ...contacto, direcciones: lista };
  }
  function guardarContacto(id, datos) {
    const { direcciones: lista, ...campos } = datos;
    // Sin async: better-sqlite3 ejecuta transacciones síncronas.
    return db.transaction((tx) => {
      const contacto = id === null
        ? tx.insert(contactos).values(campos).returning().get()
        : tx.update(contactos).set(campos).where(eq(contactos.id, id)).returning().get();
      if (!contacto) throw errorHttp(404, 'El contacto no existe.');
      // PUT reemplaza la colección completa; [] significa quitar todas.
      tx.delete(direcciones).where(eq(direcciones.contactoId, contacto.id)).run();
      if (lista.length) tx.insert(direcciones).values(
        lista.map((d) => ({ ...d, contactoId: contacto.id }))
      ).run();
      return leerContacto(contacto.id, tx);
    });
  }

  // Datos ficticios: se insertan solo al crear el archivo, no en cada reinicio.
  if (nueva && semilla) {
    const ejemplos = [
      { nombre: 'Ana', apellido: 'García', domicilio: 'Calle de Prueba 100',
        direcciones: [{ tipo: 'celular', valor: '+54 381 000-0001' }, { tipo: 'email', valor: 'ana@example.test' }] },
      { nombre: 'Bruno', apellido: 'Pérez', domicilio: 'Pasaje Ejemplo 200',
        direcciones: [{ tipo: 'telefono', valor: '0381 000-0002' }] },
      { nombre: 'Carla', apellido: 'López', domicilio: 'Avenida Demo 300',
        direcciones: [{ tipo: 'email', valor: 'carla@example.test' }, { tipo: 'celular', valor: '+54 381 000-0003' }] },
      { nombre: 'Diego', apellido: 'Ruiz', domicilio: '', direcciones: [] },
    ];
    db.transaction(() => ejemplos.forEach((c) => guardarContacto(null, validar(c))));
  }

  // 4. HTTP. La API recibe y devuelve JSON; no construye el formulario.
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (req, res, next) => {
    const origen = req.get('origin');
    // Para demostrar otro puerto con Live Server. No es autenticación.
    if (origen) {
      if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origen))
        return res.status(403).json({ error: 'Origen no permitido. Usá HTTP local.' });
      res.set('Access-Control-Allow-Origin', origen);
      res.vary('Origin');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    res.set('Cache-Control', 'no-store');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    if (['POST', 'PUT'].includes(req.method) && !req.is('application/json'))
      return res.status(415).json({ error: 'Usá Content-Type: application/json.' });
    if (logHttp) res.on('finish', () => console.log(req.method, req.originalUrl, res.statusCode));
    next();
  });
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/contactos', (req, res) => {
    if (req.query.q !== undefined && (typeof req.query.q !== 'string' || req.query.q.length > 100))
      throw errorHttp(400, 'q debe ser un texto de hasta 100 caracteres.');
    const q = normalizar(req.query.q ?? '').trim();
    const contiene = (columna) => sql`instr(normalizar(${columna}), ${q}) > 0`;
    const filtro = q ? or(
      contiene(sql`${contactos.nombre} || ' ' || ${contactos.apellido} || ' ' || ${contactos.domicilio}`),
      exists(db.select({ uno: sql`1` }).from(direcciones).where(and(
        eq(direcciones.contactoId, contactos.id), contiene(direcciones.valor)
      )))
    ) : undefined;
    const filas = db.select({ id: contactos.id, nombre: contactos.nombre,
      apellido: contactos.apellido, domicilio: contactos.domicilio,
      cantidadDirecciones: count(direcciones.id) })
      .from(contactos).leftJoin(direcciones, eq(direcciones.contactoId, contactos.id))
      .where(filtro).groupBy(contactos.id)
      .orderBy(sql`normalizar(${contactos.apellido})`, sql`normalizar(${contactos.nombre})`, asc(contactos.id)).all();
    res.json(filas);
  });
  app.get('/api/contactos/:id', (req, res) => res.json(leerContacto(leerId(req.params.id))));
  app.post('/api/contactos', (req, res) => {
    const contacto = guardarContacto(null, validar(req.body));
    res.location(`/api/contactos/${contacto.id}`).status(201).json(contacto);
  });
  app.put('/api/contactos/:id', (req, res) => {
    res.json(guardarContacto(leerId(req.params.id), validar(req.body)));
  });
  app.delete('/api/contactos/:id', (req, res) => {
    const eliminado = db.delete(contactos).where(eq(contactos.id, leerId(req.params.id)))
      .returning({ id: contactos.id }).get();
    if (!eliminado) throw errorHttp(404, 'El contacto no existe.');
    // SQLite elimina las direcciones mediante ON DELETE CASCADE.
    res.status(204).end();
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta de API inexistente.' }));

  // Solo este HTML es público. NO exponemos la carpeta del proyecto ni agenda.db.
  app.get(['/', '/index.html'], (req, res) => res.sendFile(resolve(carpeta, 'index.html')));
  app.get('/favicon.ico', (req, res) => res.status(204).end());
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.type === 'entity.parse.failed' ? 400 : (error.status || 500);
    if (status >= 500) console.error(error);
    const mensaje = error.type === 'entity.parse.failed' ? 'JSON inválido.'
      : status === 413 ? 'El cuerpo supera 32 KB.'
      : status >= 500 ? 'Error interno del servidor.' : error.message;
    res.status(status).json({ error: mensaje });
  });
  return { app, db, sqlite };
}

// 5. ARRANQUE. npm start → se crea agenda.db y se sirve la página.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('PORT inválido.');
  const { app, sqlite } = crearAplicacion({
    archivo: process.env.DB_FILE ? resolve(process.env.DB_FILE) : resolve(carpeta, 'agenda.db'),
    semilla: process.env.SEED !== '0',
    logSql: process.env.LOG_SQL === '1',
  });
  const servidor = app.listen(port, '127.0.0.1', () => {
    console.log(`\nAgenda → http://127.0.0.1:${port}\nSolo demostración local, sin autenticación.\n`);
  });
  servidor.on('error', (error) => { console.error(error.message); sqlite.close(); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    servidor.close(() => { sqlite.close(); process.exit(0); });
  });
}
