/**
 * AGENDA — SERVIDOR
 *
 * Recorrido sugerido para la clase:
 *   1. Modelo relacional: contactos y direcciones.
 *   2. Persistencia: operaciones con Drizzle.
 *   3. API REST: traducción entre HTTP y operaciones de datos.
 *   4. Infraestructura: validación, SQLite y arranque.
 *
 * Este archivo no construye la interfaz. La API recibe y devuelve JSON.
 */

import express from 'express';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, integer, text, index, check } from 'drizzle-orm/sqlite-core';
import { eq, and, or, exists, count, asc, sql } from 'drizzle-orm';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARCHIVO_SERVIDOR = fileURLToPath(import.meta.url);
const CARPETA_PROYECTO = dirname(ARCHIVO_SERVIDOR);
const TIPOS_DE_DIRECCION = ['telefono', 'celular', 'email'];
const MAXIMO_DIRECCIONES = 20;

// #region 1. Modelo relacional

export const contactos = sqliteTable('contactos', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  nombre:    text('nombre').notNull(),
  apellido:  text('apellido').notNull(),
  domicilio: text('domicilio').notNull().default(''),
});

export const direcciones = sqliteTable(
  'direcciones',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),

    // Cada dirección pertenece a un contacto. Al borrar el padre, se borra la hija.
    contactoId: integer('contacto_id').notNull().references(() => contactos.id, { onDelete: 'cascade' }),

    tipo:  text('tipo', { enum: TIPOS_DE_DIRECCION }).notNull(),
    valor: text('valor').notNull(),
  },
  (tabla) => [
    index('direcciones_contacto_idx').on(tabla.contactoId),
    check(
      'direcciones_tipo_check',
      sql`${tabla.tipo} in ('telefono', 'celular', 'email')`,
    ),
    check('direcciones_valor_check', sql`length(trim(${tabla.valor})) > 0`),
  ],
);

// #endregion

// #region 2. Persistencia — estas funciones no conocen Express ni HTTP

function buscarContactos(db, textoBusqueda) {
  const filtro = crearFiltroDeBusqueda(db, textoBusqueda);

  return db
    .select({
      id:        contactos.id,
      nombre:    contactos.nombre,
      apellido:  contactos.apellido,
      domicilio: contactos.domicilio,
      cantidadDirecciones: count(direcciones.id),
    })
    .from(contactos)
    .leftJoin(direcciones, eq(direcciones.contactoId, contactos.id))
    .where(filtro)
    .groupBy(contactos.id)
    .orderBy(
      sql`normalizar(${contactos.apellido})`,
      sql`normalizar(${contactos.nombre})`,
      asc(contactos.id),
    )
    .all();
}

function obtenerContacto(db, id) {
  const contacto = db
    .select()
    .from(contactos)
    .where(eq(contactos.id, id))
    .get();

  if (!contacto) {
    return null;
  }

  const direccionesDelContacto = db
    .select({ tipo: direcciones.tipo, valor: direcciones.valor })
    .from(direcciones)
    .where(eq(direcciones.contactoId, id))
    .orderBy(asc(direcciones.id))
    .all();

  // Dos tablas SQL se presentan como un único objeto JSON anidado.
  return { ...contacto, direcciones: direccionesDelContacto };
}

function crearContacto(db, datos) {
  return db.transaction((transaccion) => {
    const contactoCreado = transaccion
      .insert(contactos)
      .values(extraerDatosPersonales(datos))
      .returning()
      .get();

    insertarDirecciones(transaccion, contactoCreado.id, datos.direcciones);

    return obtenerContacto(transaccion, contactoCreado.id);
  });
}

function actualizarContacto(db, id, datos) {
  return db.transaction((transaccion) => {
    const contactoActualizado = transaccion
      .update(contactos)
      .set(extraerDatosPersonales(datos))
      .where(eq(contactos.id, id))
      .returning()
      .get();

    if (!contactoActualizado) {
      return null;
    }

    // PUT reemplaza la colección completa. Un arreglo vacío quita todas las hijas.
    transaccion
      .delete(direcciones)
      .where(eq(direcciones.contactoId, id))
      .run();

    insertarDirecciones(transaccion, id, datos.direcciones);

    return obtenerContacto(transaccion, id);
  });
}

function eliminarContacto(db, id) {
  const contactoEliminado = db
    .delete(contactos)
    .where(eq(contactos.id, id))
    .returning({ id: contactos.id })
    .get();

  // La clave foránea resuelve el borrado de las direcciones; no hacemos otro DELETE.
  return contactoEliminado ?? null;
}

function extraerDatosPersonales(contacto) {
  return {
    nombre: contacto.nombre,
    apellido: contacto.apellido,
    domicilio: contacto.domicilio,
  };
}

function insertarDirecciones(db, contactoId, listaDeDirecciones) {
  if (listaDeDirecciones.length === 0) {
    return;
  }

  const filas = listaDeDirecciones.map((direccion) => ({
    contactoId,
    tipo: direccion.tipo,
    valor: direccion.valor,
  }));

  db.insert(direcciones).values(filas).run();
}

function crearFiltroDeBusqueda(db, textoBusqueda) {
  const texto = normalizarTexto(textoBusqueda).trim();

  if (texto === '') {
    return undefined;
  }

  const datosPersonales = sql`
    ${contactos.nombre} || ' ' || ${contactos.apellido} || ' ' || ${contactos.domicilio}
  `;

  const coincideElContacto   = contieneTexto(datosPersonales, texto);
  const coincideUnaDireccion = exists(
    db
      .select({ coincidencia: sql`1` })
      .from(direcciones)
      .where(
        and(
          eq(direcciones.contactoId, contactos.id),
          contieneTexto(direcciones.valor, texto),
        ),
      ),
  );

  // EXISTS evita que el filtro reduzca la cantidad de direcciones del resumen.
  return or(coincideElContacto, coincideUnaDireccion);
}

function contieneTexto(columna, texto) {
  // Parámetro SQL, no concatenación. % y _ se buscan como caracteres literales.
  return sql`instr(normalizar(${columna}), ${texto}) > 0`;
}

// #endregion

// #region 3. API REST — validar entrada, ejecutar una operación, responder

function registrarRutasDeContactos(app, db) {
  app.get('/api/contactos', (solicitud, respuesta) => {
    const textoBusqueda = validarBusqueda(solicitud.query.q);
    const resultados = buscarContactos(db, textoBusqueda);

    respuesta.json(resultados);
  });

  app.get('/api/contactos/:id', (solicitud, respuesta) => {
    const id = validarId(solicitud.params.id);
    const contacto = obtenerContacto(db, id);

    exigirContactoExistente(contacto);
    respuesta.json(contacto);
  });

  app.post('/api/contactos', (solicitud, respuesta) => {
    const datos = validarContacto(solicitud.body);
    const contactoCreado = crearContacto(db, datos);

    respuesta.location(`/api/contactos/${contactoCreado.id}`);
    respuesta.status(201).json(contactoCreado);
  });

  app.put('/api/contactos/:id', (solicitud, respuesta) => {
    const id = validarId(solicitud.params.id);
    const datos = validarContacto(solicitud.body);
    const contactoActualizado = actualizarContacto(db, id, datos);

    exigirContactoExistente(contactoActualizado);
    respuesta.json(contactoActualizado);
  });

  app.delete('/api/contactos/:id', (solicitud, respuesta) => {
    const id = validarId(solicitud.params.id);
    const contactoEliminado = eliminarContacto(db, id);

    exigirContactoExistente(contactoEliminado);
    respuesta.status(204).end();
  });
}

function exigirContactoExistente(contacto) {
  if (!contacto) {
    throw crearErrorHttp(404, 'El contacto no existe.');
  }
}

// #endregion

// #region 4. Validación de la entrada HTTP

function validarContacto(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw crearErrorHttp(400, 'Se esperaba un objeto JSON.');
  }

  if (!Array.isArray(cuerpo.direcciones)) {
    throw crearErrorHttp(400, 'direcciones debe ser un arreglo.');
  }

  if (cuerpo.direcciones.length > MAXIMO_DIRECCIONES) {
    throw crearErrorHttp(400, 'Se admiten hasta 20 direcciones por contacto.');
  }

  // Lista explícita de campos admitidos: los IDs recibidos no controlan la relación.
  return {
    nombre:    validarTexto(cuerpo.nombre, 'nombre', 80),
    apellido:  validarTexto(cuerpo.apellido, 'apellido', 80),
    domicilio: validarTexto(cuerpo.domicilio, 'domicilio', 200, false),
    direcciones: cuerpo.direcciones.map(validarDireccion),
  };
}

function validarTexto(valor, nombreDelCampo, longitudMaxima, obligatorio = true) {
  if (typeof valor !== 'string') {
    throw crearErrorHttp(400, `${nombreDelCampo} debe ser texto.`);
  }

  const texto = valor.trim();

  if (obligatorio && texto === '') {
    throw crearErrorHttp(400, `${nombreDelCampo} es obligatorio.`);
  }

  if (texto.length > longitudMaxima) {
    throw crearErrorHttp(400, `${nombreDelCampo}: máximo ${longitudMaxima} caracteres.`);
  }

  return texto;
}

function validarDireccion(direccion, posicion) {
  const nombreDelCampo = `Dirección ${posicion + 1}`;

  if (!direccion || !TIPOS_DE_DIRECCION.includes(direccion.tipo)) {
    throw crearErrorHttp(400, `${nombreDelCampo}: tipo inválido.`);
  }

  const valor = validarTexto(direccion.valor, nombreDelCampo, 254);
  const formatoDeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (direccion.tipo === 'email' && !formatoDeEmail.test(valor)) {
    throw crearErrorHttp(400, `${nombreDelCampo}: email inválido.`);
  }

  return { tipo: direccion.tipo, valor };
}

function validarId(valor) {
  const id = Number(valor);
  const esEnteroPositivo = /^[1-9]\d*$/.test(valor);

  if (!esEnteroPositivo || !Number.isSafeInteger(id)) {
    throw crearErrorHttp(400, 'El ID debe ser un entero positivo.');
  }

  return id;
}

function validarBusqueda(valor = '') {
  if (typeof valor !== 'string' || valor.length > 100) {
    throw crearErrorHttp(400, 'q debe ser un texto de hasta 100 caracteres.');
  }

  return valor;
}

function crearErrorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// #endregion

// #region 5. Infraestructura HTTP — no contiene reglas de la agenda

function permitirAccesoLocal(solicitud, respuesta, siguiente) {
  const origen = solicitud.get('origin');
  const esOrigenLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  if (origen && !esOrigenLocal.test(origen)) {
    throw crearErrorHttp(403, 'Origen no permitido. Usá HTTP local.');
  }

  if (origen) {
    respuesta.set('Access-Control-Allow-Origin', origen);
    respuesta.vary('Origin');
    respuesta.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    respuesta.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  respuesta.set('Cache-Control', 'no-store');

  if (solicitud.method === 'OPTIONS') {
    respuesta.status(204).end();
    return;
  }

  siguiente();
}

function exigirCuerpoJson(solicitud, respuesta, siguiente) {
  const requiereJson = ['POST', 'PUT'].includes(solicitud.method);

  if (requiereJson && !solicitud.is('application/json')) {
    throw crearErrorHttp(415, 'Usá Content-Type: application/json.');
  }

  siguiente();
}

function registrarPeticion(solicitud, respuesta, siguiente) {
  respuesta.on('finish', () => {
    console.log(solicitud.method, solicitud.originalUrl, respuesta.statusCode);
  });

  siguiente();
}

function responderError(error, solicitud, respuesta, siguiente) {
  if (respuesta.headersSent) {
    siguiente(error);
    return;
  }

  let status = error.status || 500;
  let mensaje = error.message;

  if (error.type === 'entity.parse.failed') {
    status = 400;
    mensaje = 'JSON inválido.';
  } else if (status === 413) {
    mensaje = 'El cuerpo supera 32 KB.';
  } else if (status >= 500) {
    console.error(error);
    mensaje = 'Error interno del servidor.';
  }

  respuesta.status(status).json({ error: mensaje });
}

// #endregion

// #region 6. Preparación de SQLite y datos de ejemplo

function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function crearTablas(db) {
  // Declarar tablas en Drizzle no las crea en SQLite. Este SQL solo inicializa
  // la demo. Los cambios futuros del esquema necesitan migraciones.
  db.transaction((transaccion) => {
    transaccion.run(sql`
      CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        domicilio TEXT NOT NULL DEFAULT ''
      )
    `);

    transaccion.run(sql`
      CREATE TABLE IF NOT EXISTS direcciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contacto_id INTEGER NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
        tipo TEXT NOT NULL CONSTRAINT direcciones_tipo_check
          CHECK (tipo IN ('telefono', 'celular', 'email')),
        valor TEXT NOT NULL CONSTRAINT direcciones_valor_check
          CHECK (length(trim(valor)) > 0)
      )
    `);

    transaccion.run(sql`
      CREATE INDEX IF NOT EXISTS direcciones_contacto_idx
      ON direcciones(contacto_id)
    `);
  });
}

function cargarDatosDeEjemplo(db) {
  const ejemplos = [
    {
      nombre:    'Ana',
      apellido:  'García',
      domicilio: 'Calle de Prueba 100',
      direcciones: [
        { tipo: 'celular', valor: '+54 381 000-0001' },
        { tipo: 'email', valor: 'ana@example.test' },
      ],
    },
    {
      nombre:    'Bruno',
      apellido:  'Pérez',
      domicilio: 'Pasaje Ejemplo 200',
      direcciones: [{ tipo: 'telefono', valor: '0381 000-0002' }],
    },
    {
      nombre:    'Carla',
      apellido:  'López',
      domicilio: 'Avenida Demo 300',
      direcciones: [
        { tipo: 'email', valor: 'carla@example.test' },
        { tipo: 'celular', valor: '+54 381 000-0003' },
      ],
    },
    {
      nombre:    'Diego',
      apellido:  'Ruiz',
      domicilio: '',
      direcciones: [],
    },
  ];

  db.transaction((transaccion) => {
    for (const ejemplo of ejemplos) {
      crearContacto(transaccion, validarContacto(ejemplo));
    }
  });
}

// #endregion

// #region 7. Composición y arranque de la aplicación

// La misma fábrica sirve para arrancar el servidor o probarlo con una base temporal.
export function crearAplicacion({
  archivo = resolve(CARPETA_PROYECTO, 'agenda.db'),
  semilla = true,
  logSql  = false,
  logHttp = true,
} = {}) {
  const esBaseNueva = archivo === ':memory:' || !existsSync(archivo);
  const sqlite = new Database(archivo);

  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');
  sqlite.function('normalizar', { deterministic: true }, normalizarTexto);

  const db = drizzle(sqlite, { logger: logSql });
  crearTablas(db);

  if (esBaseNueva && semilla) {
    cargarDatosDeEjemplo(db);
  }

  const app = express();
  app.disable('x-powered-by');
  app.use('/api', permitirAccesoLocal, exigirCuerpoJson);

  if (logHttp) {
    app.use('/api', registrarPeticion);
  }

  app.use(express.json({ limit: '32kb' }));
  registrarRutasDeContactos(app, db);

  app.use('/api', (solicitud, respuesta) => {
    respuesta.status(404).json({ error: 'Ruta de API inexistente.' });
  });

  // Solo publicamos el HTML; nunca la carpeta completa ni el archivo agenda.db.
  app.get(['/', '/index.html'], (solicitud, respuesta) => {
    respuesta.sendFile(resolve(CARPETA_PROYECTO, 'index.html'));
  });

  app.get('/favicon.ico', (solicitud, respuesta) => {
    respuesta.status(204).end();
  });

  app.use(responderError);

  return { app, db, sqlite };
}

function iniciarServidor() {
  const puerto = Number(process.env.PORT || 3000);

  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error('PORT inválido.');
  }

  const archivo = process.env.DB_FILE
    ? resolve(process.env.DB_FILE)
    : resolve(CARPETA_PROYECTO, 'agenda.db');

  const { app, sqlite } = crearAplicacion({
    archivo,
    semilla: process.env.SEED !== '0',
    logSql: process.env.LOG_SQL === '1',
  });

  const servidor = app.listen(puerto, '127.0.0.1', () => {
    console.log(`Agenda → http://127.0.0.1:${puerto}`);
    console.log('Demostración local, sin autenticación.');
  });

  servidor.on('error', (error) => {
    console.error(error.message);
    sqlite.close();
    process.exitCode = 1;
  });

  function cerrarServidor() {
    servidor.close(() => {
      sqlite.close();
      process.exit(0);
    });
  }

  process.once('SIGINT', cerrarServidor);
  process.once('SIGTERM', cerrarServidor);
}

const seEjecutaDirectamente = process.argv[1]
  && resolve(process.argv[1]) === ARCHIVO_SERVIDOR;

if (seEjecutaDirectamente) {
  iniciarServidor();
}

// #endregion
