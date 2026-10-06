# Construir la capa de datos con SQLite y Drizzle

En este apunte reemplazamos el archivo JSON de la agenda por una base de datos. Empezamos con SQLite en un archivo local, que alcanza para desarrollar. Al final conectamos el mismo código a una base remota sin cambiar ninguna consulta.

El recorrido va en este orden: qué es una base de datos, cómo se le habla con SQL y cómo se usa la librería desde Node. Con eso escribimos el repositorio de contactos a mano. Después vemos qué es un ORM, rehacemos el repositorio con Drizzle y aprendemos a cambiar la estructura de la base con migraciones. Cerramos con la base remota.

Las rutas de la API casi no cambian. Esa es la ventaja de haber separado el repositorio en la clase anterior.

## Por qué dejar el archivo JSON

El repositorio que tenemos guarda todos los contactos en `datos/contactos.json`. Funciona, pero tiene 3 problemas.

El primero es el acceso simultáneo. Si 2 pedidos de creación llegan casi juntos, los 2 leen el archivo antes de que el otro escriba, y uno de los contactos se pierde.

El segundo es el costo. Para traer un solo contacto leemos e interpretamos el archivo entero. Con 10 contactos no se nota; con 100.000, sí.

El tercero es que las reglas viven solo en nuestro código. Nada impide que otro programa escriba en el archivo un contacto sin nombre o 2 contactos con el mismo correo.

Una base de datos es un programa especializado en resolver justamente esto. Coordina los accesos simultáneos, encuentra datos sin recorrer todo y hace cumplir reglas sobre lo que se guarda.

## Bases de servidor y bases embebidas

Hay 2 formas de usar una base de datos.

Una base de servidor, como PostgreSQL o MySQL, es un programa aparte. Corre en su propio proceso, muchas veces en otra máquina, y nuestro servidor se conecta a ella por la red.

Una base embebida, como SQLite, es una librería que vive dentro de nuestro programa. No hay otro proceso ni conexión de red: la base es un archivo en el disco y la librería lo lee y lo escribe. Para desarrollar es ideal, porque no hay nada que instalar ni configurar.

Vamos a usar libSQL, una variante de SQLite mantenida por la empresa Turso. Habla el mismo SQL que SQLite y tiene una ventaja: su librería de Node puede abrir un archivo local o conectarse a una base remota. Lo único que cambia es la dirección que le pasamos.

```text
desarrollo   file:agenda.db                         un archivo en tu máquina
producción   libsql://agenda-tu-usuario.turso.io    una base en la nube
```

## Tablas, filas y columnas

Una base relacional guarda los datos en tablas. Una tabla se parece a una planilla: cada columna es un dato con un tipo fijo y cada fila es un registro.

```text
contactos
┌────┬───────────┬──────────────┬────────────────┐
│ id │ nombre    │ telefono     │ email          │
├────┼───────────┼──────────────┼────────────────┤
│  1 │ Ana Díaz  │ 381-555-0101 │ NULL           │
│  2 │ Bruno Paz │ NULL         │ bruno@mail.com │
└────┴───────────┴──────────────┴────────────────┘
```

`NULL` significa que el dato no está. No es lo mismo que un texto vacío ni que el número cero.

SQLite tiene pocos tipos: `INTEGER` para enteros, `REAL` para números con decimales, `TEXT` para textos y `BLOB` para datos binarios. Las fechas se guardan como texto o como número.

Cada tabla necesita una clave primaria: una columna cuyo valor identifica a cada fila sin repetirse. En SQLite, una columna declarada `INTEGER PRIMARY KEY` tiene un comportamiento especial: si al insertar no le damos valor, la base genera el siguiente número. Esto resuelve el problema de los identificadores repetidos que teníamos con el archivo.

## El lenguaje SQL

A la base se le habla en SQL, un lenguaje para describir qué datos queremos, no cómo buscarlos. La base decide cómo hacerlo.

Las palabras de SQL se escriben en mayúsculas por convención. No es obligatorio, pero ayuda a distinguirlas de los nombres de tablas y columnas.

### Crear la tabla

```sql
CREATE TABLE IF NOT EXISTS contactos (
  id       INTEGER PRIMARY KEY,
  nombre   TEXT NOT NULL,
  telefono TEXT,
  email    TEXT UNIQUE
);
```

`NOT NULL` obliga a que la columna tenga valor. `UNIQUE` impide que 2 filas tengan el mismo valor en esa columna; varias filas pueden tener `NULL`. Estas restricciones las controla la base: ningún programa puede saltarlas.

`IF NOT EXISTS` evita un error si la tabla ya existe.

### Insertar

```sql
INSERT INTO contactos (nombre, telefono)
VALUES ('Ana Díaz', '381-555-0101');
```

Se nombran las columnas y después los valores en el mismo orden. Las columnas que no se nombran quedan en `NULL`, salvo `id`, que la base genera.

### Consultar

```sql
SELECT * FROM contactos;

SELECT id, nombre FROM contactos WHERE id = 1;

SELECT * FROM contactos WHERE nombre LIKE '%ana%' ORDER BY nombre;
```

`SELECT` elige las columnas; `*` significa todas. `WHERE` filtra las filas. `ORDER BY` las ordena.

`LIKE` compara con un patrón, donde `%` reemplaza a cualquier cantidad de caracteres. `'%ana%'` encuentra los nombres que contienen "ana" en cualquier posición. En SQLite, `LIKE` no distingue mayúsculas de minúsculas en las letras sin tilde.

### Modificar y borrar

```sql
UPDATE contactos SET email = 'ana@mail.com' WHERE id = 1;

DELETE FROM contactos WHERE id = 1;
```

Un `UPDATE` o un `DELETE` sin `WHERE` afecta a todas las filas de la tabla. Es uno de los errores más caros que se pueden cometer con una base de datos.

### Pedir de vuelta lo que cambió

Después de insertar o modificar, la API tiene que devolver el contacto como quedó. En lugar de hacer una segunda consulta, SQLite acepta `RETURNING`:

```sql
INSERT INTO contactos (nombre) VALUES ('Ana Díaz') RETURNING *;
```

La instrucción inserta y devuelve la fila creada, con el `id` que generó la base.

## Conectarse desde Node

Instalá la librería en el proyecto de la agenda:

```bash
npm install @libsql/client
```

Para probarla antes de tocar la API, escribí un script aparte:

```js
// practica.js
import { createClient } from '@libsql/client';

const cliente = createClient({ url: 'file:practica.db' });

await cliente.execute(`
  CREATE TABLE IF NOT EXISTS contactos (
    id       INTEGER PRIMARY KEY,
    nombre   TEXT NOT NULL,
    telefono TEXT,
    email    TEXT UNIQUE
  )
`);

const insercion = await cliente.execute({
  sql: 'INSERT INTO contactos (nombre, telefono) VALUES (?, ?)',
  args: ['Ana Díaz', '381-555-0101'],
});
console.log(insercion.lastInsertRowid);   // 1n
console.log(insercion.rowsAffected);      // 1

const consulta = await cliente.execute('SELECT * FROM contactos');
console.log(consulta.columns);            // [ 'id', 'nombre', 'telefono', 'email' ]
console.log(consulta.rows[0].nombre);     // Ana Díaz

cliente.close();
```

`createClient` abre la base. La dirección `file:practica.db` indica un archivo en la carpeta desde donde ejecutás `node`. Si no existe, se crea. La carpeta, en cambio, tiene que existir.

`execute` envía una instrucción y devuelve una promesa con el resultado. El resultado tiene 4 partes que vamos a usar:

- `rows`, un arreglo con las filas; cada fila se lee como objeto, por nombre de columna
- `columns`, los nombres de las columnas
- `rowsAffected`, cuántas filas cambió un `INSERT`, `UPDATE` o `DELETE`
- `lastInsertRowid`, el `id` de la última fila insertada

`lastInsertRowid` es un `BigInt`, por eso se imprime `1n`. Los enteros de SQLite pueden ser más grandes que lo que un `number` de JavaScript representa con exactitud. Con `RETURNING` no lo vamos a necesitar.

## Parámetros, nunca texto pegado

Para buscar un contacto por nombre, la tentación es armar el SQL con una plantilla:

```js
// NO HACER ESTO
const sql = `SELECT * FROM contactos WHERE nombre = '${nombre}'`;
```

Si `nombre` viene del cliente y vale `' OR '1'='1`, el SQL que se ejecuta es este:

```sql
SELECT * FROM contactos WHERE nombre = '' OR '1'='1'
```

La condición siempre se cumple y la consulta devuelve toda la tabla. Con otros valores se pueden borrar datos. Este ataque se llama inyección de SQL y es de los más comunes en aplicaciones web.

La solución es no mezclar nunca el SQL con los datos. Se escribe un signo `?` donde va cada valor y los valores se pasan aparte, en `args`:

```js
await cliente.execute({
  sql: 'SELECT * FROM contactos WHERE nombre = ?',
  args: [nombre],
});
```

La librería envía el SQL y los valores por separado. La base nunca interpreta un valor como parte de la instrucción, contenga lo que contenga.

También se pueden usar nombres en lugar de posiciones:

```js
await cliente.execute({
  sql: 'INSERT INTO contactos (nombre, email) VALUES (:nombre, :email)',
  args: { nombre: 'Bruno Paz', email: 'bruno@mail.com' },
});
```

Un detalle: `args` no acepta `undefined`. Para un dato ausente hay que pasar `null`.

## Del REST al SQL

Cada operación de la API se traduce a una instrucción SQL. Tener esta tabla presente hace que el repositorio se escriba casi solo.

| Pedido | SQL | Si no hay filas |
|---|---|---|
| `GET /contactos` | `SELECT * FROM contactos` | arreglo vacío |
| `GET /contactos?buscar=ana` | `SELECT ... WHERE nombre LIKE '%ana%'` | arreglo vacío |
| `GET /contactos/3` | `SELECT ... WHERE id = 3` | 404 |
| `POST /contactos` | `INSERT ... RETURNING *` | no aplica |
| `PUT /contactos/3` | `UPDATE ... SET` todas las columnas `WHERE id = 3` | 404 |
| `PATCH /contactos/3` | `UPDATE ... SET` algunas columnas `WHERE id = 3` | 404 |
| `DELETE /contactos/3` | `DELETE ... WHERE id = 3` | 404 |

Hay una traducción más, en sentido contrario. Si un `INSERT` o un `UPDATE` intenta repetir un correo, la base rechaza la operación por la restricción `UNIQUE`. Para la API eso es un conflicto con el estado actual del recurso: código 409.

## El repositorio con SQL

Ahora reescribimos `src/contactos.repositorio.js`. Las funciones mantienen el mismo nombre y devuelven lo mismo que antes: un contacto, `null` o `true` y `false`. Por eso las rutas no se enteran del cambio.

Primero, un módulo que crea el cliente una sola vez para toda la aplicación:

```js
// src/db/cliente.js
import { createClient } from '@libsql/client';

export const cliente = createClient({
  url: process.env.DB_URL ?? 'file:agenda.db',
  authToken: process.env.DB_TOKEN,
});
```

La dirección sale de una variable de entorno. Si no está definida, usamos un archivo local. Al final del apunte usamos esas variables para apuntar a la base remota.

### Crear la tabla al arrancar

```js
// src/contactos.repositorio.js
import { cliente } from './db/cliente.js';
import { ErrorHttp } from './errores.js';

export async function crearTabla() {
  await cliente.execute(`
    CREATE TABLE IF NOT EXISTS contactos (
      id       INTEGER PRIMARY KEY,
      nombre   TEXT NOT NULL,
      telefono TEXT,
      email    TEXT UNIQUE
    )
  `);
}
```

```js
// src/servidor.js
import { app } from './app.js';
import { crearTabla } from './contactos.repositorio.js';

const PUERTO = process.env.PUERTO ?? 3000;

await crearTabla();

app.listen(PUERTO, () => {
  console.log(`API escuchando en http://localhost:${PUERTO}`);
});
```

El `await` en el nivel superior del módulo funciona porque usamos módulos de JavaScript. El servidor no empieza a escuchar hasta que la tabla existe.

### Listar y buscar

```js
export async function listar({ buscar } = {}) {
  if (buscar) {
    const resultado = await cliente.execute({
      sql: 'SELECT * FROM contactos WHERE nombre LIKE ? ORDER BY nombre',
      args: [`%${buscar}%`],
    });
    return resultado.rows;
  }
  const resultado = await cliente.execute('SELECT * FROM contactos ORDER BY nombre');
  return resultado.rows;
}
```

Antes filtrábamos en JavaScript después de leer todo. Ahora el filtro va en el `WHERE` y la base devuelve solo lo que coincide.

Los `%` se agregan al valor, no al SQL. El SQL sigue teniendo un solo `?` y el valor viaja aparte.

La ruta cambia para pasarle el texto de búsqueda al repositorio:

```js
// src/contactos.rutas.js
rutasContactos.get('/', async (req, res) => {
  const { buscar } = req.query;
  const contactos = await repositorio.listar({
    buscar: typeof buscar === 'string' ? buscar : undefined,
  });
  res.json(contactos);
});
```

Es el único cambio en las rutas de toda la clase.

### Obtener uno

```js
export async function obtener(id) {
  const resultado = await cliente.execute({
    sql: 'SELECT * FROM contactos WHERE id = ?',
    args: [id],
  });
  return resultado.rows[0] ?? null;
}
```

Un `SELECT` siempre devuelve un arreglo, aunque busquemos por clave primaria. Si no hay filas, `rows[0]` es `undefined` y devolvemos `null`, como antes.

### Proteger el correo único

Crear, reemplazar y modificar pueden chocar con la restricción `UNIQUE` del correo. Para no repetir el mismo `try` y `catch` 3 veces, lo envolvemos en una función:

```js
async function cuidandoEmail(operacion) {
  try {
    return await operacion();
  } catch (error) {
    const codigo = error.extendedCode ?? error.cause?.extendedCode;
    if (codigo === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new ErrorHttp(409, 'Ya existe un contacto con ese email');
    }
    throw error;
  }
}
```

`cuidandoEmail` recibe una función, la ejecuta y traduce un solo error: la violación de la restricción única. Cualquier otro error se relanza y termina en el manejador de errores como un 500.

La librería informa el motivo en `extendedCode`. Si no está ahí, lo buscamos en `error.cause`, porque cuando usemos Drizzle el error de la base va a llegar envuelto en otro error.

### Crear

```js
export async function crear(datos) {
  return cuidandoEmail(async () => {
    const resultado = await cliente.execute({
      sql: `INSERT INTO contactos (nombre, telefono, email)
            VALUES (?, ?, ?)
            RETURNING *`,
      args: [datos.nombre, datos.telefono ?? null, datos.email ?? null],
    });
    return resultado.rows[0];
  });
}
```

`datos` viene de `validarContacto`, así que solo trae campos conocidos. Los opcionales pueden faltar; `?? null` los convierte en `NULL`.

### Reemplazar

```js
export async function reemplazar(id, datos) {
  return cuidandoEmail(async () => {
    const resultado = await cliente.execute({
      sql: `UPDATE contactos
            SET nombre = ?, telefono = ?, email = ?
            WHERE id = ?
            RETURNING *`,
      args: [datos.nombre, datos.telefono ?? null, datos.email ?? null, id],
    });
    return resultado.rows[0] ?? null;
  });
}
```

`PUT` asigna todas las columnas. Las que el cliente no envió quedan en `NULL`, que es lo que significa reemplazar. Si el `id` no existe, el `UPDATE` no cambia ninguna fila, `RETURNING` no devuelve nada y respondemos `null`.

### Modificar

```js
export async function modificar(id, cambios) {
  const columnas = Object.keys(cambios);
  if (columnas.length === 0) return obtener(id);

  return cuidandoEmail(async () => {
    const asignaciones = columnas.map(columna => `${columna} = ?`).join(', ');
    const resultado = await cliente.execute({
      sql: `UPDATE contactos SET ${asignaciones} WHERE id = ? RETURNING *`,
      args: [...Object.values(cambios), id],
    });
    return resultado.rows[0] ?? null;
  });
}
```

`PATCH` asigna solo las columnas que vinieron, así que el SQL se arma según el pedido. Para `{"email": "ana@mail.com"}` queda `UPDATE contactos SET email = ? WHERE id = ? RETURNING *`.

Acá sí pegamos texto en el SQL: los nombres de las columnas. Es seguro solo porque `validarContacto` garantiza que las claves de `cambios` son `nombre`, `telefono` o `email`. Los valores siguen viajando en `args`. Si mañana alguien saca esa validación, este código queda abierto a inyección.

Si el cuerpo vino vacío, no hay nada que cambiar y devolvemos el contacto como está.

### Borrar

```js
export async function borrar(id) {
  const resultado = await cliente.execute({
    sql: 'DELETE FROM contactos WHERE id = ?',
    args: [id],
  });
  return resultado.rowsAffected > 0;
}
```

`rowsAffected` dice cuántas filas borró. Si es cero, el contacto no existía.

### Lo que ganamos

Con el servidor en marcha (`npm run dev`), los mismos pedidos de la clase anterior funcionan igual. Hay 2 diferencias visibles: los campos ausentes aparecen como `null` en lugar de no aparecer, y un correo repetido responde 409.

El problema de los pedidos simultáneos desapareció. La base genera los identificadores y ordena las escrituras: 2 inserciones al mismo tiempo nunca pisan una a la otra.

## Lo que se repite con SQL a mano

El repositorio funciona, pero tiene costos que crecen con el proyecto.

El SQL es texto. Si escribís `telfono` en lugar de `telefono`, nadie te avisa hasta que ese pedido se ejecuta y falla.

Los nombres de las columnas están repetidos en cada instrucción. Agregar una columna obliga a revisar todas las funciones.

El `UPDATE` dinámico de `PATCH` arma SQL con texto, con el riesgo que ya vimos.

La estructura de la tabla vive en un texto dentro de `crearTabla`. Y `CREATE TABLE IF NOT EXISTS` no sirve para cambiarla: si la tabla ya existe, no hace nada. Agregar una columna a una base que ya tiene datos requiere otra herramienta.

## Qué es un ORM

ORM significa mapeo objeto-relacional. Es una librería que se ubica entre el código y la base y resuelve la traducción entre los 2 mundos: tablas y filas de un lado, objetos y funciones del otro.

Un ORM hace 3 cosas:

- describe las tablas en código, así la estructura de la base vive en un solo lugar
- arma las consultas con funciones en lugar de texto, y usa siempre parámetros para los valores
- convierte las filas que devuelve la base en objetos de JavaScript

Hay ORM que esconden el SQL casi por completo. Drizzle, el que vamos a usar, hace lo contrario: sus funciones se llaman y se encadenan como las palabras de SQL. Quien sabe SQL lee Drizzle sin esfuerzo, y por eso empezamos aprendiendo SQL.

Un ORM no reemplaza a SQL. Es otra capa que hay que aprender, y cuando una consulta se complica, conviene saber qué SQL está generando.

## Instalar Drizzle

Drizzle se instala en 2 paquetes:

```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

`drizzle-orm` es la librería que usa la aplicación para consultar. `drizzle-kit` es una herramienta de línea de comandos para manejar la estructura de la base; solo se usa durante el desarrollo, por eso va con `-D`.

Mientras se escribe este apunte, la versión estable es la 0.45 y la 1.0 está en etapa de candidata. `npm install` instala la estable, que es la que usamos.

## Describir la tabla

La estructura de la tabla se describe en un módulo de JavaScript:

```js
// src/db/esquema.js
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const contactos = sqliteTable('contactos', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  telefono: text('telefono'),
  email: text('email').unique(),
});
```

Compará con el `CREATE TABLE`: es la misma información, línea por línea. `sqliteTable` recibe el nombre de la tabla en la base y un objeto con las columnas.

En cada columna, la clave del objeto (`telefono`) es el nombre que usamos en JavaScript. El texto entre paréntesis (`'telefono'`) es el nombre en la base. Acá coinciden, pero podrían ser distintos, por ejemplo `fechaAlta` en el código y `fecha_alta` en la base.

El objeto `contactos` que exportamos no tiene datos. Es la descripción de la tabla, y lo vamos a pasar a las consultas para decir de qué tabla y de qué columnas hablamos.

## Conectar Drizzle al cliente

Drizzle no se conecta solo a la base. Usa el cliente de libSQL que ya creamos:

```js
// src/db/index.js
import { drizzle } from 'drizzle-orm/libsql';
import { cliente } from './cliente.js';

export const db = drizzle(cliente);
```

`db` es el objeto con el que vamos a armar todas las consultas.

## Consultas con Drizzle

Cada instrucción de SQL tiene su función. Las condiciones del `WHERE` se arman con funciones que se importan de `drizzle-orm`: `eq` para igual, `like` para patrones, `asc` y `desc` para ordenar, entre otras.

```js
import { eq, like, asc } from 'drizzle-orm';
import { db } from './db/index.js';
import { contactos } from './db/esquema.js';

// SELECT * FROM contactos WHERE id = ?
await db.select().from(contactos).where(eq(contactos.id, 3));

// SELECT * FROM contactos WHERE nombre LIKE ? ORDER BY nombre
await db.select().from(contactos)
  .where(like(contactos.nombre, '%ana%'))
  .orderBy(asc(contactos.nombre));

// INSERT INTO contactos (nombre) VALUES (?) RETURNING *
await db.insert(contactos).values({ nombre: 'Ana Díaz' }).returning();

// UPDATE contactos SET email = ? WHERE id = ? RETURNING *
await db.update(contactos).set({ email: 'ana@mail.com' }).where(eq(contactos.id, 1)).returning();

// DELETE FROM contactos WHERE id = ? RETURNING *
await db.delete(contactos).where(eq(contactos.id, 1)).returning();
```

Las consultas se leen en el mismo orden que el SQL. Los valores se pasan como objetos: `values` y `set` reciben un objeto con las claves de JavaScript, y Drizzle arma la lista de columnas. El `UPDATE` dinámico del `PATCH` desaparece.

Hay un detalle importante: una consulta de Drizzle no se ejecuta hasta que se espera con `await`. Antes de eso es solo una descripción. Podemos pedirle el SQL que va a enviar con `toSQL()`:

```js
const consulta = db.select().from(contactos).where(like(contactos.nombre, '%ana%'));
console.log(consulta.toSQL());
```

```text
{
  sql: 'select "id", "nombre", "telefono", "email" from "contactos" where "contactos"."nombre" like ?',
  params: [ '%ana%' ]
}
```

Es SQL con parámetros, igual al que escribíamos a mano. Drizzle no hace magia: arma el texto por nosotros.

## El repositorio con Drizzle

Con estas piezas, el repositorio completo queda así:

```js
// src/contactos.repositorio.js
import { eq, like, asc } from 'drizzle-orm';
import { db } from './db/index.js';
import { contactos } from './db/esquema.js';
import { ErrorHttp } from './errores.js';

async function cuidandoEmail(operacion) {
  try {
    return await operacion();
  } catch (error) {
    const codigo = error.extendedCode ?? error.cause?.extendedCode;
    if (codigo === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new ErrorHttp(409, 'Ya existe un contacto con ese email');
    }
    throw error;
  }
}

export async function listar({ buscar } = {}) {
  return db
    .select()
    .from(contactos)
    .where(buscar ? like(contactos.nombre, `%${buscar}%`) : undefined)
    .orderBy(asc(contactos.nombre));
}

export async function obtener(id) {
  const [contacto] = await db.select().from(contactos).where(eq(contactos.id, id));
  return contacto ?? null;
}

export async function crear(datos) {
  return cuidandoEmail(async () => {
    const [contacto] = await db.insert(contactos).values(datos).returning();
    return contacto;
  });
}

export async function reemplazar(id, datos) {
  return cuidandoEmail(async () => {
    const [contacto] = await db
      .update(contactos)
      .set({ telefono: null, email: null, ...datos })
      .where(eq(contactos.id, id))
      .returning();
    return contacto ?? null;
  });
}

export async function modificar(id, cambios) {
  if (Object.keys(cambios).length === 0) return obtener(id);
  return cuidandoEmail(async () => {
    const [contacto] = await db
      .update(contactos)
      .set(cambios)
      .where(eq(contactos.id, id))
      .returning();
    return contacto ?? null;
  });
}

export async function borrar(id) {
  const borrados = await db.delete(contactos).where(eq(contactos.id, id)).returning();
  return borrados.length > 0;
}
```

Algunas decisiones de este código:

- en `listar`, si no hay búsqueda le pasamos `undefined` a `where`, y Drizzle lo ignora, así una sola consulta cubre los 2 casos
- las consultas devuelven arreglos, por eso desestructuramos el primer elemento con `const [contacto]`
- en `reemplazar`, ponemos `telefono` y `email` en `null` antes de esparcir `datos`, y así los campos ausentes se borran, como pide `PUT`
- en `modificar`, Drizzle no acepta un `set` vacío, por eso el caso sin cambios se resuelve antes
- `borrar` usa `returning` para saber si borró algo, en lugar de contar filas afectadas

Si comparás con la versión en SQL, no queda ningún texto de SQL ni ninguna lista de columnas. La estructura de la tabla vive solo en `esquema.js`.

La función `crearTabla` ya no existe, y `servidor.js` vuelve a ser el de la clase anterior:

```js
// src/servidor.js
import { app } from './app.js';

const PUERTO = process.env.PUERTO ?? 3000;

app.listen(PUERTO, () => {
  console.log(`API escuchando en http://localhost:${PUERTO}`);
});
```

¿Quién crea la tabla, entonces? Las migraciones.

## Migraciones

Una base de datos cambia a lo largo de la vida de un proyecto. Hoy la tabla tiene 4 columnas; el mes que viene puede necesitar una columna de notas o una tabla de empresas. Y esos cambios hay que aplicarlos en cada copia de la base: la tuya, la de tus compañeros y la de producción, que ya tiene datos que no se pueden perder.

Una migración es un archivo SQL con un cambio puntual a la estructura. Las migraciones se numeran y se aplican en orden, cada una una sola vez. La base guarda en una tabla propia cuáles ya se aplicaron. Así, cualquier copia de la base puede ponerse al día ejecutando las que le faltan.

`drizzle-kit` escribe las migraciones por nosotros. Compara el esquema de `esquema.js` con el que tenía la última vez y genera el SQL de la diferencia.

### Configurar drizzle-kit

En la raíz del proyecto:

```js
// drizzle.config.js
import { defineConfig } from 'drizzle-kit';

try {
  process.loadEnvFile();
} catch {
  // sin archivo .env: se usa la base local
}

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/esquema.js',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DB_URL ?? 'file:agenda.db',
    authToken: process.env.DB_TOKEN,
  },
});
```

`dialect: 'turso'` le dice que hable con libSQL, tanto en un archivo local como en una base remota. `schema` indica dónde está la descripción de las tablas y `out`, dónde guardar las migraciones.

`process.loadEnvFile()` carga las variables del archivo `.env`, si existe. Lo vamos a usar al conectarnos a la base remota.

Agregá los comandos al `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --env-file-if-exists=.env --watch src/servidor.js",
    "start": "node --env-file-if-exists=.env src/servidor.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "node --env-file-if-exists=.env src/db/semilla.js",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@libsql/client": "^0.18.0",
    "drizzle-orm": "^0.45.3",
    "express": "^5.2.1"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.11"
  }
}
```

`--env-file-if-exists=.env` hace que Node cargue el archivo `.env` al arrancar, si lo encuentra. Necesita Node 22 o posterior.

### Generar y aplicar la primera migración

Borrá el archivo `agenda.db` que creó la versión con SQL, así empezamos de cero. Después:

```bash
npm run db:generate -- --name crear_contactos
```

`drizzle-kit` lee el esquema, ve que la tabla no existía y escribe la migración:

```sql
-- drizzle/0000_crear_contactos.sql
CREATE TABLE `contactos` (
	`id` integer PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`telefono` text,
	`email` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contactos_email_unique` ON `contactos` (`email`);
```

Es el mismo `CREATE TABLE` que escribíamos a mano. La restricción `UNIQUE` aparece como un índice único, que es como SQLite la implementa por dentro.

Generar no toca la base. Para aplicar la migración:

```bash
npm run db:migrate
```

La base ahora tiene 2 tablas: `contactos` y `__drizzle_migrations`, donde `drizzle-kit` anota qué migraciones ya aplicó. Si ejecutás `db:migrate` otra vez, no hace nada.

### Cargar datos de ejemplo

La tabla está vacía. Para probar la API sin crear contactos a mano cada vez, escribimos una semilla: un script que deja la base con datos de ejemplo conocidos.

```js
// src/db/semilla.js
import { db } from './index.js';
import { cliente } from './cliente.js';
import { contactos } from './esquema.js';

if (process.env.DB_URL?.startsWith('libsql://')) {
  console.error('La semilla borra todo: no se ejecuta en la base remota.');
  process.exit(1);
}

const ejemplos = [
  { nombre: 'Ana Díaz', telefono: '381-555-0101', email: 'ana@mail.com' },
  { nombre: 'Bruno Paz', telefono: '381-555-0202', email: 'bruno@mail.com' },
  { nombre: 'Carla Ruiz', telefono: '381-555-0303', email: null },
];

const [, insertados] = await db.batch([
  db.delete(contactos),
  db.insert(contactos).values(ejemplos).returning(),
]);

console.log(`Semilla cargada: ${insertados.length} contactos`);
cliente.close();
```

```bash
npm run db:seed
```

```text
Semilla cargada: 3 contactos
```

La semilla primero borra todos los contactos y después inserta los 3 de ejemplo. Así, ejecutarla 2 veces deja la base igual que ejecutarla una: siempre los mismos 3 contactos, con los ids 1, 2 y 3. Esto ayuda en clase, porque todos tienen los mismos datos y los mismos ids para probar.

`db.batch` envía las 2 instrucciones juntas, dentro de una transacción: o se aplican las 2, o ninguna. Si la inserción fallara, el borrado se deshace y la base no queda vacía.

`insert` acepta un arreglo de objetos e inserta todos en una sola instrucción. `batch` devuelve un resultado por instrucción; el segundo es el arreglo de contactos insertados.

Como borra todo, la semilla se niega a correr si `DB_URL` apunta a una base remota. Es una protección simple contra un error caro: ejecutarla con el `.env` de producción cargado.

`cliente.close()` cierra la conexión. Sin esa línea, el script termina igual, pero cerrar explícitamente deja claro que el trabajo terminó.

### Cambiar la estructura

Supongamos que queremos guardar notas sobre cada contacto. Agregamos la columna al esquema:

```js
export const contactos = sqliteTable('contactos', {
  id: integer('id').primaryKey(),
  nombre: text('nombre').notNull(),
  telefono: text('telefono'),
  email: text('email').unique(),
  notas: text('notas'),
});
```

Y generamos otra migración:

```bash
npm run db:generate -- --name agregar_notas
```

```sql
-- drizzle/0001_agregar_notas.sql
ALTER TABLE `contactos` ADD `notas` text;
```

`drizzle-kit` no recrea la tabla: escribe solo la diferencia. Al aplicarla, los contactos que ya estaban quedan con `notas` en `NULL`.

Para que la API acepte el campo nuevo, falta agregarlo a `validarContacto`. El repositorio no se toca: Drizzle ya conoce la columna.

### Qué se guarda en el repositorio de código

La carpeta `drizzle/` va al control de versiones. Ahí están las migraciones y una carpeta `meta/` con las fotos del esquema que `drizzle-kit` usa para comparar. Cuando un compañero baja tus cambios, ejecuta `npm run db:migrate` y su base queda igual a la tuya.

El archivo `.db` no va al control de versiones. Cada uno tiene su propia base con sus propios datos de prueba.

### Otras herramientas de drizzle-kit

`npm run db:studio` abre en el navegador una interfaz para ver y editar los datos de la base. Es útil para revisar qué guardó la API.

`npx drizzle-kit push` aplica el esquema directo a la base, sin generar archivos de migración. Sirve para probar ideas rápido en tu máquina, pero no deja registro de los cambios, así que no se usa para una base con datos que importan.

## Configuración por entorno

El código ya sabe leer la dirección de la base desde `DB_URL` y la credencial desde `DB_TOKEN`. Esa información cambia según dónde corre el programa, y no pertenece al código.

En desarrollo no hace falta definir nada: sin variables, todo apunta a `file:agenda.db`. Para otra configuración, se crea un archivo `.env` en la raíz:

```bash
# .env
DB_URL=libsql://agenda-tu-usuario.turso.io
DB_TOKEN=eyJhbGciOi...
```

El token es una contraseña. Quien lo tenga puede leer y borrar la base. Por eso `.env` nunca va al control de versiones, y lo agregamos a `.gitignore` junto con las bases locales:

```text
# .gitignore
node_modules/
.env
*.db
```

En un servidor de producción no se usa un archivo `.env`: las variables se cargan en el panel del servicio donde se publica la aplicación.

## Pasar a una base remota

Turso ofrece bases libSQL en la nube, con un plan gratuito que alcanza para la materia. Se administran con su herramienta de línea de comandos. En macOS y Linux se instala así; en Windows, dentro de WSL:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

Con la herramienta instalada, son 4 pasos:

```bash
turso auth signup                   # crear la cuenta (o turso auth login)
turso db create agenda              # crear la base
turso db show agenda --url          # ver la dirección: libsql://...
turso db tokens create agenda       # crear el token
```

Copiá la dirección y el token en el archivo `.env`. Después aplicá las migraciones en la base remota:

```bash
npm run db:migrate
```

Es el mismo comando de siempre. Como ahora existe `.env`, `drizzle.config.js` carga las variables y `drizzle-kit` se conecta a la base remota en lugar del archivo.

Por último, arrancá la API:

```bash
npm run dev
```

Node carga `.env`, `cliente.js` lee `DB_URL` y `DB_TOKEN` y el cliente se conecta a Turso. Ninguna consulta cambió. Si borrás o renombrás `.env`, todo vuelve a la base local.

Hay una diferencia que conviene tener presente: con la base remota, cada consulta viaja por internet. Lo que con el archivo tardaba un milisegundo puede tardar decenas. Por eso importa pedirle a la base exactamente lo que se necesita, como hicimos al mover el filtro de búsqueda al `WHERE`.

Turso desarrolla también un motor nuevo, con librerías propias que recomienda para proyectos nuevos. Drizzle todavía las soporta solo en versión beta. `@libsql/client` sigue siendo la forma estable de conectar Drizzle con Turso, y es la que usamos.

## La estructura final

```text
agenda-api/
├── .env                          solo si usás la base remota; no va a git
├── .gitignore
├── drizzle.config.js             configuración de drizzle-kit
├── package.json
├── drizzle/                      migraciones generadas; sí va a git
│   ├── 0000_crear_contactos.sql
│   └── meta/
└── src/
    ├── servidor.js
    ├── app.js
    ├── middlewares.js
    ├── errores.js
    ├── contactos.rutas.js        un solo cambio: pasa buscar
    ├── contactos.validacion.js
    ├── contactos.repositorio.js  ahora con Drizzle
    └── db/
        ├── cliente.js            el cliente de libSQL
        ├── index.js              Drizzle sobre ese cliente
        ├── esquema.js            la descripción de las tablas
        └── semilla.js            carga 3 contactos de ejemplo
```

## Resumen del recorrido

Una base de datos coordina los accesos simultáneos, encuentra datos sin recorrer todo y hace cumplir reglas. SQLite lo hace dentro de nuestro programa, con un archivo, y libSQL permite usar la misma librería contra una base remota.

A la base se le habla en SQL. Los valores viajan siempre como parámetros, separados del texto de la instrucción, para evitar la inyección de SQL.

Cada operación de la API se traduce a una instrucción: `GET` a `SELECT`, `POST` a `INSERT`, `PUT` y `PATCH` a `UPDATE`, `DELETE` a `DELETE`. Una fila que no existe es un 404 y una restricción violada, un 409.

Un ORM describe las tablas en código y arma las consultas con funciones. Drizzle lo hace con una forma muy cercana a SQL, y siempre podemos ver el SQL que genera.

Las migraciones registran cada cambio de estructura en un archivo, para que cualquier copia de la base pueda ponerse al día. La semilla deja la base local con datos de ejemplo conocidos.

La dirección de la base y su credencial viven en variables de entorno. Cambiar de una base local a una remota es cambiar esas variables, no el código.
