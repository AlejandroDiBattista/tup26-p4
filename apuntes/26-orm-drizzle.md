# Drizzle ORM: la base de datos desde JavaScript

Drizzle es una librería que te deja describir la base de datos en JavaScript y consultarla con funciones en lugar de cadenas de SQL. Sigue de cerca la forma del SQL, así que lo que sabés de SQL te sirve directamente.

Este apunte arranca por el problema que resuelve, arma los conceptos desde cero y termina con una agenda de clientes con tareas pendientes que funciona contra SQLite local y contra Turso, una base SQLite en la nube.

## El problema que resuelve

Con la librería básica de SQLite, cada consulta es una cadena de texto que el programa le manda a la base:

```js
const filas = await cliente.execute({
  sql: 'SELECT id, nombre, emial FROM clientes WHERE id = ?',
  args: [id],
});
```

Funciona, pero tiene cuatro problemas que crecen con el proyecto.

El primero es que los errores aparecen tarde. La columna `emial` está mal escrita y nada lo avisa hasta que la consulta se ejecuta. El editor ve una cadena, no sabe que adentro hay SQL.

El segundo es que la estructura de la base vive en dos lugares. Las tablas se crean con un `CREATE TABLE` en un archivo `.sql` y el código usa esas columnas en otro lado. Si alguien renombra una columna, hay que encontrar a mano cada consulta que la usa.

El tercero es la traducción manual. La base devuelve filas con nombres como `cliente_id`, valores booleanos guardados como 0 y 1, y fechas como texto. El programa tiene que convertir todo eso a objetos de JavaScript cada vez.

El cuarto son los cambios de estructura. Cuando la aplicación ya tiene datos, agregar una columna exige escribir un `ALTER TABLE`, llevar la cuenta de qué cambios se aplicaron en cada base (la tuya, la de un compañero, la de producción) y aplicarlos en orden.

Drizzle resuelve los cuatro:

- describís cada tabla una sola vez, en JavaScript, y esa descripción es la fuente de verdad
- las consultas se arman con funciones que conocen las columnas, así que el editor autocompleta y marca errores
- convierte automáticamente entre los tipos de la base y los de JavaScript
- compara tu descripción con la base y genera el SQL necesario para ponerlas al día

## Conceptos fundamentales

### Base relacional

Una base relacional guarda datos en tablas. Cada tabla tiene columnas con un tipo (texto, número) y filas, que son los registros.

Toda tabla tiene una clave primaria: una columna cuyo valor identifica a cada fila sin repetirse. Lo habitual es un número entero que la base asigna sola, llamado autoincremental.

Una clave foránea es una columna que guarda la clave primaria de otra tabla. Así se vinculan las tablas. En nuestra agenda, cada tarea tiene una columna `cliente_id` que apunta al cliente al que pertenece.

Las restricciones son reglas que la base hace cumplir sola: que una columna no quede vacía (`NOT NULL`), que no se repita (`UNIQUE`) o que una clave foránea apunte a una fila que existe.

### Tipos de relación

Las relaciones entre tablas son de tres tipos:

- uno a muchos: un cliente tiene muchas tareas y cada tarea es de un solo cliente; se resuelve con una clave foránea en la tabla del lado "muchos"
- uno a uno: un cliente tiene un solo perfil; es un caso particular del anterior con la clave foránea marcada como única
- muchos a muchos: una tarea tiene varias etiquetas y una etiqueta se usa en varias tareas; necesita una tabla intermedia que guarde los pares

### ORM y constructor de consultas

Hay tres formas de hablar con una base desde un programa.

Un driver es la librería mínima: recibe una cadena SQL y devuelve filas. Es lo que usaste con la librería básica de SQLite.

Un constructor de consultas arma el SQL a partir de funciones. `select().from(clientes).where(eq(clientes.id, 1))` produce `SELECT ... FROM clientes WHERE id = 1`. La estructura es la del SQL, pero escrita como código.

Un ORM (mapeador objeto-relacional) va un paso más allá: te deja pensar en objetos y sus vínculos. Pedís "el cliente con sus tareas" y recibís un objeto con un arreglo `tareas` adentro, sin escribir el join.

Drizzle ofrece las dos últimas formas sobre el mismo esquema. Por eso se lo llama ORM, aunque es más delgado que la mayoría: no esconde el SQL, lo vuelve más seguro de escribir.

### Las piezas de Drizzle

Drizzle se reparte en dos paquetes con trabajos distintos.

`drizzle-orm` es la librería que usa tu programa en tiempo de ejecución. Contiene las funciones para definir tablas y hacer consultas.

`drizzle-kit` es una herramienta de línea de comandos que usás vos mientras desarrollás. Lee el esquema, lo compara con la base y genera o aplica los cambios.

Además, necesitás un driver para la base concreta. Para SQLite y Turso usamos `@libsql/client`.

```text
        vos (desarrollo)                     tu programa (ejecución)
             │                                        │
       drizzle-kit ── lee ──► schema.js ◄── importa ── drizzle-orm
             │                                        │
    genera y aplica SQL                       arma consultas SQL
             │                                        │
             └────────────► @libsql/client ◄──────────┘
                                   │
                    archivo agenda.db  o  base en Turso
```

### Migraciones

Una migración es un archivo SQL que lleva la base de un estado al siguiente: crear las tablas, agregar una columna, crear un índice.

Las migraciones se guardan en el proyecto y se aplican en orden. La base anota cuáles ya aplicó, así que correr el proceso dos veces no repite nada.

Esto permite que cualquier copia de la base, vacía o con datos, llegue al mismo estado ejecutando las migraciones pendientes.

### Todo es asíncrono

Hablar con la base es una operación de entrada y salida. Por eso toda consulta de Drizzle devuelve una promesa y se usa con `await`.

Una consulta no se ejecuta cuando la armás sino cuando la esperás con `await`. Hasta ese momento es solo una descripción que podés seguir completando.

## Instalación

Este apunte usa Drizzle 1.0, que en octubre de 2026 está en etapa de candidata a versión final (`1.0.0-rc.4`). La versión estable anterior (0.45) define las relaciones con otra sintaxis. Los ejemplos de la documentación oficial ya usan la nueva.

```bash
mkdir agenda && cd agenda
npm init -y
npm pkg set type=module
npm i drizzle-orm@rc @libsql/client dotenv
npm i -D drizzle-kit@rc drizzle-seed@rc
```

`type=module` habilita `import` y `export` en los archivos `.js`. `dotenv` lee las variables de entorno desde un archivo `.env`. `drizzle-seed` genera datos de prueba.

La estructura final del proyecto es esta:

```text
agenda/
├── .env                  datos de conexión (no se sube al repositorio)
├── drizzle.config.js     configuración de drizzle-kit
├── drizzle/              migraciones generadas
├── package.json
└── src/
    ├── db/
    │   ├── schema.js     tablas
    │   ├── relations.js  relaciones para las consultas
    │   ├── index.js      conexión
    │   ├── migrar.js     aplica migraciones desde el programa
    │   └── seed.js       datos iniciales
    ├── agenda.js         clase Agenda con las operaciones
    └── demo.js           prueba de punta a punta
```

Agregá al `.gitignore` el archivo de conexión y las bases locales:

```text
node_modules
.env
*.db
```

## Configuración para SQLite y Turso

### SQLite local

SQLite guarda toda la base en un solo archivo. No hay servidor: tu programa abre el archivo y lo lee y escribe directamente. Es ideal para desarrollar.

El driver `@libsql/client` abre un archivo local si la dirección empieza con `file:`.

```text
# .env
DATABASE_URL=file:agenda.db
```

### Turso

Turso es un servicio que aloja bases SQLite en la nube. Usa libSQL, una variante de SQLite compatible con ella, y el mismo driver `@libsql/client` se conecta tanto a un archivo local como a Turso. Eso es lo que nos permite pasar de una a otra cambiando solo el `.env`.

Para crear la base usás la herramienta de línea de comandos de Turso:

```bash
turso auth login
turso db create agenda
turso db show agenda --url        # muestra libsql://agenda-<usuario>.turso.io
turso db tokens create agenda     # genera el token de acceso
```

La dirección empieza con `libsql://` y la conexión necesita además el token, que funciona como contraseña.

```text
# .env
DATABASE_URL=libsql://agenda-tuusuario.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOi...
```

### La conexión

El archivo `src/db/index.js` crea el objeto `db`, que el resto del programa importa para hacer consultas:

```js
// src/db/index.js
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { relations } from './relations.js';

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  relations,
  logger: process.env.DB_LOG === '1',
});
```

`drizzle-orm/libsql` indica qué driver usar. Cada base tiene su propio punto de entrada: `drizzle-orm/node-postgres` para PostgreSQL, por ejemplo.

`authToken` queda `undefined` con SQLite local y el driver lo ignora.

`relations` le enseña a Drizzle cómo se vinculan las tablas. Lo vemos más adelante.

`logger` imprime en consola el SQL de cada consulta. Activarlo con `DB_LOG=1 node archivo.js` es la mejor forma de ver qué hace Drizzle por dentro.

### La configuración de drizzle-kit

`drizzle-kit` necesita saber dónde está el esquema, dónde guardar las migraciones y cómo conectarse:

```js
// drizzle.config.js
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const remota = process.env.DATABASE_URL.startsWith('libsql://');

export default defineConfig({
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: remota ? 'turso' : 'sqlite',
  dbCredentials: remota
    ? { url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN }
    : { url: process.env.DATABASE_URL },
});
```

`dialect` es el tipo de base. Para un archivo local es `sqlite` y para Turso es `turso`. La variable `remota` elige el valor según la dirección del `.env`, así el mismo archivo sirve para los dos casos.

Por último, agregá atajos en `package.json`:

```json
"scripts": {
  "db:generar": "drizzle-kit generate",
  "db:migrar": "drizzle-kit migrate",
  "db:sembrar": "node src/db/seed.js",
  "db:studio": "drizzle-kit studio"
}
```

## El esquema: las tablas en JavaScript

El esquema describe cada tabla con la función `sqliteTable`. Recibe el nombre de la tabla en la base y un objeto con las columnas.

```js
// src/db/schema.js
import { sql } from 'drizzle-orm';
import { sqliteTable, integer, text, primaryKey, index, check } from 'drizzle-orm/sqlite-core';

export const clientes = sqliteTable('clientes', {
  id:       integer().primaryKey({ autoIncrement: true }),
  nombre:   text().notNull(),
  email:    text().notNull().unique(),
  telefono: text(),
  creadoEn: text('creado_en').notNull().default(sql`(datetime('now'))`),
});

export const tareas = sqliteTable('tareas', {
  id:         integer().primaryKey({ autoIncrement: true }),
  clienteId:  integer('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  titulo:     text().notNull(),
  vence:      text(),
  prioridad:  text({ enum: ['baja', 'media', 'alta'] }).notNull().default('media'),
  completada: integer({ mode: 'boolean' }).notNull().default(false),
}, (t) => [
  index('tareas_cliente_idx').on(t.clienteId),
  check('prioridad_valida', sql`${t.prioridad} in ('baja', 'media', 'alta')`),
]);

export const etiquetas = sqliteTable('etiquetas', {
  id:     integer().primaryKey({ autoIncrement: true }),
  nombre: text().notNull().unique(),
});

export const tareasEtiquetas = sqliteTable('tareas_etiquetas', {
  tareaId:    integer('tarea_id').notNull().references(() => tareas.id, { onDelete: 'cascade' }),
  etiquetaId: integer('etiqueta_id').notNull().references(() => etiquetas.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.tareaId, t.etiquetaId] }),
]);
```

Vamos por partes.

### Dos nombres para cada columna

La clave del objeto es el nombre que usás en JavaScript. El texto que recibe la función, si lo hay, es el nombre en la base.

En `clienteId: integer('cliente_id')`, el programa trabaja con `tarea.clienteId` y la base guarda la columna `cliente_id`. Así cada lado sigue su convención: camelCase en JavaScript, snake_case en SQL. Si omitís el texto, como en `nombre: text()`, los dos nombres coinciden.

### Tipos de columna en SQLite

SQLite tiene pocos tipos de almacenamiento. Drizzle agrega modos que convierten el valor al leer y al escribir:

| En el esquema | Se guarda como | En JavaScript |
|---|---|---|
| `integer()` | entero | `number` |
| `integer({ mode: 'boolean' })` | 0 o 1 | `true` o `false` |
| `integer({ mode: 'timestamp' })` | segundos desde 1970 | `Date` |
| `real()` | número con decimales | `number` |
| `text()` | texto | `string` |
| `text({ mode: 'json' })` | texto JSON | objeto o arreglo |
| `blob()` | bytes | `Buffer` |

En la agenda guardamos las fechas como texto con el formato `AAAA-MM-DD`. Ese formato tiene una propiedad útil: el orden alfabético coincide con el cronológico, así que `<`, `>` y `ORDER BY` funcionan sin conversión. Además, SQLite trae funciones de fecha que lo entienden, como `date()`.

### Restricciones

Los métodos encadenados agregan reglas a la columna:

- `.primaryKey({ autoIncrement: true })`: clave primaria con número asignado por la base
- `.notNull()`: la columna no puede quedar vacía
- `.unique()`: el valor no se repite en la tabla
- `.default(valor)`: valor que se usa si el insert no trae ninguno
- `.references(() => otraTabla.columna)`: clave foránea

El valor por defecto de `creadoEn` usa `sql`, una plantilla que inserta SQL literal. `datetime('now')` es una función de SQLite, así que la fecha la pone la base en el momento del insert.

`references` recibe una función flecha y no la columna directamente. Es para poder referenciar tablas definidas más abajo en el archivo: la función se evalúa cuando todas ya existen.

`onDelete: 'cascade'` dice qué pasa con las tareas cuando se borra su cliente: se borran también. Las otras opciones son `'restrict'` (impedir el borrado si tiene tareas) y `'set null'` (dejar la tarea sin cliente, lo que exige que la columna acepte nulos).

### El enum y el check

`text({ enum: [...] })` documenta los valores válidos y, en TypeScript, hace que el editor rechace otros. Pero no crea ninguna regla en la base: en JavaScript podés guardar `'urgentísima'` sin error.

Para que la base lo impida, agregamos un `check`, que es una restricción con una condición SQL. Ahora un insert con una prioridad inválida falla con `CHECK constraint failed: prioridad_valida`.

### Índices y claves compuestas

El segundo argumento de `sqliteTable` es una función que recibe las columnas de la tabla y devuelve un arreglo con índices y restricciones que abarcan la tabla entera.

Un índice acelera las búsquedas por una columna, igual que el índice de un libro. Como vamos a buscar seguido "las tareas del cliente X", indexamos `cliente_id`.

La tabla `tareas_etiquetas` no tiene `id` propio. Su clave primaria es el par `(tarea_id, etiqueta_id)`, lo que además impide asignar dos veces la misma etiqueta a una tarea.

## Las relaciones

Las claves foráneas del esquema le dicen a la base cómo se vinculan las tablas. Pero Drizzle necesita además saber cómo querés navegar esos vínculos en las consultas: qué nombre tiene la propiedad, si es uno o muchos, y por dónde pasa.

Eso se declara aparte, en un solo lugar, con `defineRelations`:

```js
// src/db/relations.js
import { defineRelations } from 'drizzle-orm';
import * as schema from './schema.js';

export const relations = defineRelations(schema, (r) => ({
  clientes: {
    tareas: r.many.tareas(),
  },
  tareas: {
    cliente: r.one.clientes({
      from: r.tareas.clienteId,
      to: r.clientes.id,
      optional: false,
    }),
    etiquetas: r.many.etiquetas({
      from: r.tareas.id.through(r.tareasEtiquetas.tareaId),
      to: r.etiquetas.id.through(r.tareasEtiquetas.etiquetaId),
    }),
  },
  etiquetas: {
    tareas: r.many.tareas(),
  },
}));
```

`import * as schema` junta todas las tablas exportadas en un objeto. `defineRelations` lo recorre y te da `r`, que conoce cada tabla y columna.

Para cada tabla declarás propiedades. Cada una es una relación:

- `r.one.clientes(...)` dice que la propiedad apunta a un solo cliente
- `r.many.tareas(...)` dice que la propiedad es un arreglo de tareas
- `from` es la columna de esta tabla y `to` la de la otra; juntas describen la condición del join

`optional: false` indica que toda tarea tiene cliente. Sirve para que, en TypeScript, `tarea.cliente` no se considere posiblemente vacío.

Cuando una relación ya está descripta de un lado, el otro se puede declarar sin argumentos. `clientes.tareas` es `r.many.tareas()` porque Drizzle deduce la condición a partir de `tareas.cliente`.

La relación muchos a muchos usa `through`. Se lee así: desde `tareas.id`, pasando por `tareas_etiquetas.tarea_id`, hasta `etiquetas.id`, pasando por `tareas_etiquetas.etiqueta_id`. Con eso, pedir las etiquetas de una tarea devuelve directamente las etiquetas, sin la tabla intermedia en el medio.

Las relaciones no cambian la base. No generan migraciones ni restricciones. Solo le sirven a Drizzle para armar las consultas de la sección "Consultas relacionales".

## Crear la base con migraciones

Con el esquema escrito, la base todavía no existe. Se crea en dos pasos.

Primero, `generate` compara el esquema con el estado anterior y escribe el SQL necesario:

```bash
npm run db:generar -- --name inicial
```

Aparece una carpeta `drizzle/20261015182314_inicial/` con dos archivos. `snapshot.json` es la foto del esquema en ese momento, que se usa para comparar en la próxima generación. `migration.sql` contiene el SQL. Este es un fragmento, sin las tablas de etiquetas:

```sql
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nombre` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`telefono` text,
	`creado_en` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tareas` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`cliente_id` integer NOT NULL,
	`titulo` text NOT NULL,
	`vence` text,
	`prioridad` text DEFAULT 'media' NOT NULL,
	`completada` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_tareas_cliente_id_clientes_id_fk` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE,
	CONSTRAINT "prioridad_valida" CHECK("prioridad" in ('baja', 'media', 'alta'))
);
--> statement-breakpoint
CREATE INDEX `tareas_cliente_idx` ON `tareas` (`cliente_id`);
```

El archivo se puede leer y revisar antes de aplicarlo. Se sube al repositorio junto con el código.

Segundo, `migrate` aplica a la base las migraciones que todavía no tiene:

```bash
npm run db:migrar
```

Con SQLite local, si `agenda.db` no existe, se crea. Drizzle anota en una tabla interna qué migraciones aplicó.

### Migrar desde el programa

En producción conviene que la aplicación aplique sus migraciones al arrancar, sin depender de `drizzle-kit`, que es una dependencia de desarrollo:

```js
// src/db/migrar.js
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index.js';

await migrate(db, { migrationsFolder: './drizzle' });
console.log('Migraciones aplicadas');
```

### Atajo para prototipos: push

`drizzle-kit push` compara el esquema directamente con la base y aplica las diferencias, sin escribir archivos de migración.

Es cómodo al principio, cuando el esquema cambia cada cinco minutos y la base no tiene nada valioso. No deja registro de los cambios, así que no sirve para una base con datos reales ni para trabajar en equipo.

### Cuando el esquema cambia

Supongamos que queremos anotar detalles en cada tarea. Agregás la columna al esquema:

```js
  completada: integer({ mode: 'boolean' }).notNull().default(false),
  notas:      text(),
```

Generás y aplicás:

```bash
npm run db:generar -- --name notas
npm run db:migrar
```

La nueva migración tiene solo el cambio:

```sql
ALTER TABLE `tareas` ADD `notas` text;
```

SQLite tiene un `ALTER TABLE` limitado. Para cambios que no soporta, como agregar un `check` a una tabla existente, Drizzle genera una migración que crea una tabla nueva, copia los datos, borra la vieja y renombra la nueva. Si algún dato existente no cumple la nueva regla, la copia falla y la migración se cancela. Antes de endurecer una restricción, revisá los datos.

### Ver la base

`npm run db:studio` abre Drizzle Studio en el navegador: una interfaz para ver y editar las tablas. Sirve para comprobar el resultado de las migraciones y la siembra.

## Sembrar datos

Sembrar es cargar datos iniciales en una base recién creada, para desarrollar o probar con algo concreto. Hay dos estrategias y conviene tener las dos.

### Datos fijos

Un script con pocos datos escritos a mano. Como los datos son siempre los mismos, sabés qué esperar y podés razonar sobre los resultados.

```js
// src/db/seed.js
import { sql } from 'drizzle-orm';
import { db } from './index.js';
import { clientes, tareas, etiquetas, tareasEtiquetas } from './schema.js';

async function sembrar() {
  // 1. Vaciar, de las tablas que dependen hacia las independientes
  await db.delete(tareasEtiquetas);
  await db.delete(etiquetas);
  await db.delete(tareas);
  await db.delete(clientes);
  await db.run(sql`DELETE FROM sqlite_sequence`); // reinicia los autoincrementales

  // 2. Clientes
  const [ana, bruno, carla] = await db.insert(clientes).values([
    { nombre: 'Ana Pérez',   email: 'ana@correo.com',   telefono: '381-555-0101' },
    { nombre: 'Bruno Díaz',  email: 'bruno@correo.com', telefono: '381-555-0202' },
    { nombre: 'Carla Gómez', email: 'carla@correo.com' },
  ]).returning();

  // 3. Tareas, con los id que devolvió el insert anterior
  const ts = await db.insert(tareas).values([
    { clienteId: ana.id,   titulo: 'Enviar presupuesto',      vence: '2026-10-20', prioridad: 'alta' },
    { clienteId: ana.id,   titulo: 'Llamar para seguimiento', vence: '2026-10-25' },
    { clienteId: ana.id,   titulo: 'Firmar contrato',         vence: '2026-10-10', completada: true },
    { clienteId: bruno.id, titulo: 'Agendar reunión',         vence: '2026-10-18', prioridad: 'alta' },
    { clienteId: bruno.id, titulo: 'Mandar catálogo',         prioridad: 'baja' },
  ]).returning({ id: tareas.id });

  // 4. Etiquetas y su vínculo con las tareas
  const [urgente, ventas, llamada] = await db.insert(etiquetas).values([
    { nombre: 'urgente' }, { nombre: 'ventas' }, { nombre: 'llamada' },
  ]).returning();

  await db.insert(tareasEtiquetas).values([
    { tareaId: ts[0].id, etiquetaId: urgente.id },
    { tareaId: ts[0].id, etiquetaId: ventas.id },
    { tareaId: ts[1].id, etiquetaId: llamada.id },
    { tareaId: ts[3].id, etiquetaId: urgente.id },
  ]);

  console.log(`Sembrado: 3 clientes, ${ts.length} tareas, 3 etiquetas`);
}

await sembrar();
```

Hay cuatro detalles que importan.

El script empieza vaciando las tablas, así se puede correr las veces que haga falta y siempre deja la base en el mismo estado. El orden importa: si borrás primero los clientes, las claves foráneas de las tareas quedan apuntando a nada. Acá el `cascade` lo resolvería solo, pero el orden explícito no depende de esa configuración.

`DELETE` vacía la tabla pero no reinicia el contador del autoincremental. SQLite guarda ese contador en la tabla interna `sqlite_sequence`. Al vaciarla, el próximo cliente vuelve a tener el `id` 1.

`.returning()` hace que el insert devuelva las filas creadas, con su `id` y sus valores por defecto. Lo usamos para encadenar inserts sin adivinar qué `id` asignó la base. Con un objeto, `.returning({ id: tareas.id })`, elegís qué columnas devolver.

`values` acepta un objeto o un arreglo. Con un arreglo, todas las filas se insertan en una sola sentencia SQL.

### Datos generados

Para probar con volumen (paginado, búsquedas, rendimiento) conviene generar datos. `drizzle-seed` lee el esquema y llena las tablas con valores verosímiles:

```js
// src/db/seed-aleatorio.js
import { seed, reset } from 'drizzle-seed';
import { db } from './index.js';
import { clientes, tareas, etiquetas, tareasEtiquetas } from './schema.js';

await reset(db, { clientes, tareas, etiquetas, tareasEtiquetas });

await seed(db, { clientes, tareas }, { seed: 42 }).refine((f) => ({
  clientes: {
    count: 20,
    columns: {
      nombre: f.fullName(),
      email: f.email(),
      telefono: f.phoneNumber({ template: '381-555-####' }),
      creadoEn: f.datetime(),
    },
    with: { tareas: 3 },
  },
  tareas: {
    columns: {
      titulo: f.valuesFromArray({
        values: ['Llamar', 'Enviar presupuesto', 'Reunión', 'Cobrar factura', 'Mandar catálogo'],
      }),
      vence: f.date({ minDate: '2026-10-01', maxDate: '2026-12-31' }),
      prioridad: f.valuesFromArray({ values: ['baja', 'media', 'alta'] }),
      completada: f.boolean(),
    },
  },
}));
```

`reset` vacía las tablas. `seed` genera 20 clientes con 3 tareas cada uno, gracias a `with`. `refine` dice cómo generar cada columna; sin él, `drizzle-seed` inventa valores según el tipo, que para una columna de texto como `creadoEn` serían letras al azar.

La opción `seed: 42` es la semilla del generador de números aleatorios. Con la misma semilla, los datos salen iguales en cada corrida, lo que hace reproducibles las pruebas.

## Consultas

Drizzle ofrece dos maneras de leer datos sobre el mismo `db`. El constructor de consultas sigue la forma del SQL. Las consultas relacionales devuelven objetos anidados. Conviene conocer las dos y elegir según lo que necesites.

### El constructor de consultas

Una consulta empieza con `db.select()`, sigue con `.from(tabla)` y agrega cláusulas como en SQL:

```js
import { eq, and, lt, asc, desc, count, like } from 'drizzle-orm';
import { db } from './db/index.js';
import { clientes, tareas } from './db/schema.js';

// Todas las columnas de todos los clientes
const todos = await db.select().from(clientes);

// Solo algunas columnas, ordenadas
const nombres = await db
  .select({ id: clientes.id, nombre: clientes.nombre })
  .from(clientes)
  .orderBy(asc(clientes.nombre));
```

El resultado siempre es un arreglo de objetos, aunque haya una sola fila o ninguna. Las claves son los nombres de JavaScript, no los de la base: `creadoEn`, no `creado_en`.

Para buscar una sola fila, desestructurás el primer elemento. Si no hay coincidencias, queda `undefined`:

```js
const [cliente] = await db.select().from(clientes).where(eq(clientes.id, 7));
if (!cliente) console.log('No existe');
```

### Condiciones

Las condiciones se arman con funciones que reciben una columna y un valor:

| Función | SQL |
|---|---|
| `eq(col, v)`, `ne(col, v)` | `=`, `<>` |
| `gt`, `gte`, `lt`, `lte` | `>`, `>=`, `<`, `<=` |
| `like(col, '%ar%')` | `LIKE` |
| `inArray(col, [1, 2])` | `IN (1, 2)` |
| `between(col, a, b)` | `BETWEEN a AND b` |
| `isNull(col)`, `isNotNull(col)` | `IS NULL`, `IS NOT NULL` |
| `and(...)`, `or(...)`, `not(c)` | `AND`, `OR`, `NOT` |

```js
// Tareas sin completar vencidas antes del 19 de octubre
const vencidas = await db
  .select()
  .from(tareas)
  .where(and(eq(tareas.completada, false), lt(tareas.vence, '2026-10-19')));
```

Fijate que comparamos `completada` con `false` y no con 0. Drizzle convierte el valor según el modo de la columna.

Los valores nunca se pegan dentro del texto SQL. Drizzle los manda aparte como parámetros, así que un valor como `"'; DROP TABLE clientes; --"` se trata como texto y no puede ejecutarse. Eso es lo que protege de la inyección SQL.

### Orden y paginado

```js
const pagina = await db
  .select()
  .from(tareas)
  .orderBy(asc(tareas.vence), desc(tareas.prioridad))
  .limit(10)
  .offset(20); // salta las primeras 20: tercera página de 10
```

En SQLite, los valores nulos van primero en un orden ascendente. Una tarea sin vencimiento aparece antes que todas las que tienen fecha.

### Joins y agregados

Un join combina filas de dos tablas según una condición. `innerJoin` deja solo las filas que tienen pareja en las dos tablas:

```js
const agenda = await db
  .select({ cliente: clientes.nombre, tarea: tareas.titulo, vence: tareas.vence })
  .from(tareas)
  .innerJoin(clientes, eq(tareas.clienteId, clientes.id))
  .where(eq(tareas.completada, false))
  .orderBy(asc(tareas.vence));
```

`leftJoin` deja todas las filas de la primera tabla aunque no tengan pareja. Combinado con `groupBy` y `count`, cuenta las tareas pendientes de cada cliente, incluidos los que no tienen ninguna:

```js
const resumen = await db
  .select({ cliente: clientes.nombre, pendientes: count(tareas.id) })
  .from(clientes)
  .leftJoin(tareas, and(eq(tareas.clienteId, clientes.id), eq(tareas.completada, false)))
  .groupBy(clientes.id)
  .orderBy(desc(count(tareas.id)));
// [ { cliente: 'Ana Pérez', pendientes: 2 },
//   { cliente: 'Bruno Díaz', pendientes: 2 },
//   { cliente: 'Carla Gómez', pendientes: 0 } ]
```

La condición `completada = false` va dentro del join y no en un `where`. Si fuera en el `where`, descartaría a Carla, que no tiene tareas, porque su fila combinada tiene `completada` nulo.

Para contar sin más, existe un atajo:

```js
const cuantas = await db.$count(tareas, eq(tareas.completada, false)); // 3
```

### Ver el SQL generado

Cualquier consulta sin `await` se puede inspeccionar con `.toSQL()`:

```js
db.select().from(clientes).where(eq(clientes.id, 1)).toSQL();
// { sql: 'select "id", "nombre", ... from "clientes" where "clientes"."id" = ?',
//   params: [1] }
```

### Consultas relacionales

Las consultas relacionales usan las relaciones declaradas en `relations.js`. Están en `db.query.<tabla>` y tienen dos métodos: `findMany` devuelve un arreglo y `findFirst` devuelve un objeto o `undefined`.

En lugar de funciones, reciben un objeto que describe qué querés:

```js
const clientesConPendientes = await db.query.clientes.findMany({
  columns: { id: true, nombre: true },
  with: {
    tareas: {
      where: { completada: false },
      orderBy: { vence: 'asc' },
      columns: { titulo: true, vence: true },
    },
  },
});
```

El resultado ya viene anidado:

```js
[
  { id: 1, nombre: 'Ana Pérez', tareas: [
      { titulo: 'Enviar presupuesto', vence: '2026-10-20' },
      { titulo: 'Llamar para seguimiento', vence: '2026-10-25' } ] },
  { id: 2, nombre: 'Bruno Díaz', tareas: [
      { titulo: 'Mandar catálogo', vence: null },
      { titulo: 'Agendar reunión', vence: '2026-10-18' } ] },
  { id: 3, nombre: 'Carla Gómez', tareas: [] },
]
```

Las opciones son estas:

- `columns`: qué columnas incluir; si se omite, vienen todas
- `where`: condiciones, como objeto
- `orderBy`: un objeto con la columna y `'asc'` o `'desc'`
- `limit` y `offset`: paginado
- `with`: qué relaciones traer; cada una acepta a su vez las mismas opciones

En `where`, un valor solo significa igualdad. Para otros operadores se usa un objeto con su nombre: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `notIn`, `like`, `isNull`, `isNotNull`. Varias condiciones en el mismo objeto se combinan con `AND`. Para otras combinaciones están las claves `OR`, `AND` y `NOT`:

```js
// Tareas sin fecha o de prioridad baja
await db.query.tareas.findMany({
  where: { OR: [{ vence: { isNull: true } }, { prioridad: 'baja' }] },
});

// Prioridad alta o baja, y no completadas
await db.query.tareas.findMany({
  where: { prioridad: { in: ['alta', 'baja'] }, NOT: { completada: true } },
});
```

Las relaciones se pueden anidar en varios niveles y en ambas direcciones. Esta consulta trae las tareas vencidas con su cliente y sus etiquetas:

```js
await db.query.tareas.findMany({
  where: { completada: false, vence: { lt: '2026-10-19' } },
  with: {
    cliente: { columns: { nombre: true } },
    etiquetas: { columns: { nombre: true } },
  },
});
// [ { id: 4, titulo: 'Agendar reunión', vence: '2026-10-18', ...,
//     cliente: { nombre: 'Bruno Díaz' },
//     etiquetas: [ { nombre: 'urgente' } ] } ]
```

`cliente` es un objeto porque la relación es `one`. `etiquetas` es un arreglo porque es `many`, y gracias a `through` no aparece la tabla intermedia.

También se puede filtrar por una relación. Esta consulta trae los clientes que tienen al menos una tarea de prioridad alta sin completar:

```js
await db.query.clientes.findMany({
  columns: { nombre: true },
  where: { tareas: { prioridad: 'alta', completada: false } },
});
```

### Cuál usar

Las consultas relacionales convienen cuando querés objetos con sus relaciones adentro, como "el cliente con sus tareas" para mostrar una ficha o devolver en una API.

El constructor de consultas conviene cuando el resultado es una tabla plana o un cálculo: listados con columnas de varias tablas, conteos, sumas, agrupamientos. También cuando necesitás algo que las consultas relacionales no cubren.

Los dos usan el mismo esquema y la misma conexión, así que podés mezclarlos en el mismo programa.

## Altas, modificaciones y bajas

### Insertar

Ya lo vimos en la siembra. `insert(tabla).values(...)` agrega filas y `.returning()` las devuelve completas:

```js
const [nueva] = await db
  .insert(tareas)
  .values({ clienteId: 3, titulo: 'Primera visita', vence: '2026-10-22' })
  .returning();
// { id: 6, clienteId: 3, titulo: 'Primera visita', vence: '2026-10-22',
//   prioridad: 'media', completada: false }
```

Las columnas omitidas toman su valor por defecto o quedan nulas.

### Modificar

`update(tabla).set({...}).where(...)` cambia las columnas indicadas en las filas que cumplen la condición:

```js
const [tarea] = await db
  .update(tareas)
  .set({ completada: true })
  .where(eq(tareas.id, 4))
  .returning();
```

Sin `where`, el `update` modifica todas las filas de la tabla. Lo mismo vale para `delete`. Revisá siempre la condición antes de ejecutar.

El valor nuevo puede ser una expresión SQL que use el valor actual. Para posponer una tarea una semana, usamos la función `date` de SQLite:

```js
const modificador = '+7 days';
await db
  .update(tareas)
  .set({ vence: sql`date(${tareas.vence}, ${modificador})` })
  .where(eq(tareas.id, 2));
// '2026-10-25' pasa a '2026-11-01'
```

Dentro de la plantilla `sql`, una columna se convierte en su nombre y un valor de JavaScript se convierte en parámetro. Por eso es seguro interpolar `modificador`.

### Borrar

```js
const borrados = await db
  .delete(clientes)
  .where(eq(clientes.id, 2))
  .returning({ nombre: clientes.nombre });
// [ { nombre: 'Bruno Díaz' } ]  y sus tareas se borran por el cascade
```

Si no se borró nada, el arreglo viene vacío. Eso permite saber si la fila existía.

### Insertar o actualizar

Si el email ya existe, el insert falla por la restricción `UNIQUE`. A veces lo que querés es "si existe, actualizalo". Eso se llama upsert:

```js
await db
  .insert(clientes)
  .values({ nombre: 'Ana Pérez', email: 'ana@correo.com', telefono: '381-000' })
  .onConflictDoUpdate({ target: clientes.email, set: { telefono: '381-000' } })
  .returning();
```

`target` es la columna que define el conflicto y `set` lo que se actualiza. Con `.onConflictDoNothing()`, el insert simplemente se ignora y `returning` devuelve un arreglo vacío.

### Errores

Cuando la base rechaza una operación, la promesa falla. El mensaje de Drizzle incluye la consulta y, en `error.cause`, el motivo que dio la base:

```js
try {
  await db.insert(tareas).values({ clienteId: 999, titulo: 'Huérfana' });
} catch (error) {
  console.log(error.cause.message);
  // SQLITE_CONSTRAINT: FOREIGN KEY constraint failed
}
```

Los motivos más comunes son `UNIQUE constraint failed` (valor repetido), `NOT NULL constraint failed` (falta un dato obligatorio), `FOREIGN KEY constraint failed` (la fila referenciada no existe) y `CHECK constraint failed` (no cumple una regla).

### Transacciones

Una transacción agrupa varias operaciones para que se apliquen todas o ninguna. Si algo falla en el medio, la base vuelve al estado anterior.

Crear una tarea y etiquetarla son dos inserts. Sin transacción, si el segundo falla queda una tarea sin etiqueta:

```js
const tarea = await db.transaction(async (tx) => {
  const [t] = await tx
    .insert(tareas)
    .values({ clienteId: 3, titulo: 'Bienvenida', vence: '2026-10-30' })
    .returning();

  const [etiqueta] = await tx.select().from(etiquetas).where(eq(etiquetas.nombre, 'llamada'));
  if (!etiqueta) throw new Error('No existe la etiqueta');

  await tx.insert(tareasEtiquetas).values({ tareaId: t.id, etiquetaId: etiqueta.id });
  return t;
});
```

Dentro de la función se usa `tx` en lugar de `db`. Si la función termina bien, los cambios se confirman y `transaction` devuelve lo que retornó la función. Si lanza un error, todo se deshace y el error se propaga.

## Ejemplo integrador: la agenda

Juntamos todo en un módulo con las operaciones de la agenda. Las agrupamos como métodos estáticos de una clase `Agenda`. Cada método hace una sola cosa y devuelve datos listos para mostrar o para responder en una API.

```js
// src/agenda.js
import { eq, and, asc, count, sql } from 'drizzle-orm';
import { db } from './db/index.js';
import { clientes, tareas } from './db/schema.js';

export class Agenda {
  // Clientes con la cantidad de tareas pendientes de cada uno
  static listarClientes() {
    return db
      .select({
        id: clientes.id,
        nombre: clientes.nombre,
        pendientes: count(tareas.id),
      })
      .from(clientes)
      .leftJoin(tareas, and(eq(tareas.clienteId, clientes.id), eq(tareas.completada, false)))
      .groupBy(clientes.id)
      .orderBy(asc(clientes.nombre));
  }

  // Ficha de un cliente con todas sus tareas y las etiquetas de cada una
  static verCliente(id) {
    return db.query.clientes.findFirst({
      where: { id },
      with: {
        tareas: {
          orderBy: { vence: 'asc' },
          with: { etiquetas: { columns: { nombre: true } } },
        },
      },
    });
  }

  // Tareas pendientes, opcionalmente hasta una fecha, con los datos de contacto
  static pendientes({ hasta } = {}) {
    return db.query.tareas.findMany({
      where: hasta
        ? { completada: false, vence: { lte: hasta } }
        : { completada: false },
      orderBy: { vence: 'asc' },
      with: { cliente: { columns: { nombre: true, telefono: true } } },
    });
  }

  // Tareas pendientes cuya fecha ya pasó
  static vencidas(hoy) {
    return db.query.tareas.findMany({
      where: { completada: false, vence: { lt: hoy } },
      with: { cliente: { columns: { nombre: true } } },
    });
  }

  static async agregarCliente(datos) {
    const [nuevo] = await db.insert(clientes).values(datos).returning();
    return nuevo;
  }

  static async agregarTarea(clienteId, datos) {
    const [nueva] = await db.insert(tareas).values({ ...datos, clienteId }).returning();
    return nueva;
  }

  static async completarTarea(id) {
    const [tarea] = await db
      .update(tareas)
      .set({ completada: true })
      .where(eq(tareas.id, id))
      .returning();
    return tarea; // undefined si no existía
  }

  static async posponerTarea(id, dias) {
    const modificador = `+${dias} days`;
    const [tarea] = await db
      .update(tareas)
      .set({ vence: sql`date(${tareas.vence}, ${modificador})` })
      .where(eq(tareas.id, id))
      .returning();
    return tarea;
  }

  // Devuelve true si el cliente existía; sus tareas se borran por el cascade
  static async borrarCliente(id) {
    const borrados = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    return borrados.length === 1;
  }
}
```

Un método estático pertenece a la clase, no a sus instancias. Se llama directamente sobre el nombre de la clase, `Agenda.listarClientes()`, sin crear un objeto con `new`.

Usamos una clase porque agrupa todas las operaciones bajo un nombre y se importa de una sola vez. No hace falta crear instancias porque la agenda no guarda estado propio: todos los datos están en la base, y la conexión es el `db` compartido que importa el módulo.

Ningún método usa `this`. Así cada uno funciona aunque se lo pase suelto como función, por ejemplo `const ver = Agenda.verCliente`. En un método estático, `this` sería la clase, y se perdería al separarlo de ella.

Los métodos de consulta devuelven la consulta sin `await`. Como una consulta de Drizzle se comporta como una promesa, quien llama la espera con `await` y recibe el resultado. Los de modificación sí usan `await` adentro, porque necesitan procesar el resultado antes de devolverlo.

Un recorrido de punta a punta, sobre la base recién sembrada:

```js
// src/demo.js
import { Agenda } from './agenda.js';

const hoy = '2026-10-19';

console.table(await Agenda.listarClientes());

console.log('Vencidas al', hoy);
for (const t of await Agenda.vencidas(hoy)) {
  console.log(`- ${t.titulo} (${t.cliente.nombre}, vencía ${t.vence})`);
}

const diego = await Agenda.agregarCliente({ nombre: 'Diego Ruiz', email: 'diego@correo.com' });
await Agenda.agregarTarea(diego.id, { titulo: 'Primera visita', vence: '2026-10-22', prioridad: 'alta' });

await Agenda.completarTarea(4);                     // Agendar reunión
const pospuesta = await Agenda.posponerTarea(2, 7);
console.log('Pospuesta:', pospuesta.titulo, '→', pospuesta.vence);

console.log('Pendientes hasta fin de mes:');
for (const t of await Agenda.pendientes({ hasta: '2026-10-31' })) {
  console.log(`- ${t.vence}  ${t.titulo.padEnd(24)} ${t.cliente.nombre}`);
}

console.log('¿Borré a Bruno?', await Agenda.borrarCliente(2));
console.table(await Agenda.listarClientes());
```

```bash
npm run db:migrar
npm run db:sembrar
node src/demo.js
```

```text
┌─────────┬────┬───────────────┬────────────┐
│ (index) │ id │ nombre        │ pendientes │
├─────────┼────┼───────────────┼────────────┤
│ 0       │ 1  │ 'Ana Pérez'   │ 2          │
│ 1       │ 2  │ 'Bruno Díaz'  │ 2          │
│ 2       │ 3  │ 'Carla Gómez' │ 0          │
└─────────┴────┴───────────────┴────────────┘
Vencidas al 2026-10-19
- Agendar reunión (Bruno Díaz, vencía 2026-10-18)
Pospuesta: Llamar para seguimiento → 2026-11-01
Pendientes hasta fin de mes:
- 2026-10-20  Enviar presupuesto       Ana Pérez
- 2026-10-22  Primera visita           Diego Ruiz
¿Borré a Bruno? true
┌─────────┬────┬───────────────┬────────────┐
│ (index) │ id │ nombre        │ pendientes │
├─────────┼────┼───────────────┼────────────┤
│ 0       │ 1  │ 'Ana Pérez'   │ 2          │
│ 1       │ 3  │ 'Carla Gómez' │ 0          │
│ 2       │ 4  │ 'Diego Ruiz'  │ 1          │
└─────────┴────┴───────────────┴────────────┘
```

"Agendar reunión" no aparece entre las pendientes porque la completamos. "Llamar para seguimiento" tampoco, porque al posponerla quedó para noviembre. Al borrar a Bruno, su tarea "Mandar catálogo" se borró con él.

`Agenda.verCliente(1)` devuelve la ficha completa de Ana:

```js
{
  id: 1, nombre: 'Ana Pérez', email: 'ana@correo.com', telefono: '381-555-0101',
  creadoEn: '2026-10-15 18:25:18',
  tareas: [
    { id: 3, titulo: 'Firmar contrato', vence: '2026-10-10', prioridad: 'media',
      completada: true, etiquetas: [] },
    { id: 1, titulo: 'Enviar presupuesto', vence: '2026-10-20', prioridad: 'alta',
      completada: false, etiquetas: [ { nombre: 'urgente' }, { nombre: 'ventas' } ] },
    { id: 2, titulo: 'Llamar para seguimiento', vence: '2026-11-01', prioridad: 'media',
      completada: false, etiquetas: [ { nombre: 'llamada' } ] },
  ],
}
```

Una ruta de la API REST solo tiene que llamar a estas funciones y devolver el resultado como JSON. La lógica de datos queda en un solo lugar.

## Pasar de SQLite local a Turso

Como el driver y la configuración ya contemplan los dos casos, el cambio es de datos, no de código:

1. Creá la base en Turso y obtené la dirección y el token, como en la sección de configuración.
2. Reemplazá en `.env` la dirección `file:agenda.db` por la de Turso y agregá `DATABASE_AUTH_TOKEN`.
3. Ejecutá `npm run db:migrar` para crear las tablas en la base remota.
4. Ejecutá `npm run db:sembrar` si querés los datos de prueba.
5. Ejecutá `node src/demo.js` y comprobá que el resultado es el mismo.

La diferencia que vas a notar es la demora. Con un archivo local, cada consulta tarda microsegundos. Con Turso, cada una viaja por la red y tarda decenas de milisegundos. Una función que hace diez consultas seguidas pasa a ser perceptiblemente lenta.

Por eso, con una base remota conviene pedir todo lo posible en una sola consulta: una consulta relacional con `with` en lugar de buscar el cliente y después sus tareas por separado. Para varias operaciones independientes, `db.batch` las manda juntas en un solo viaje:

```js
const [actualizacion, lista] = await db.batch([
  db.update(tareas).set({ prioridad: 'baja' }).where(eq(tareas.id, 1)),
  db.select().from(clientes),
]);
```

`batch` se ejecuta además como una transacción: si una operación falla, ninguna se aplica.

En el día a día lo habitual es tener dos archivos de entorno: uno con la base local para desarrollar y otro con la de Turso para producción.

## Tipos con TypeScript

Todo lo anterior funciona igual en TypeScript cambiando la extensión de los archivos a `.ts`. La diferencia es que el editor conoce la forma exacta de cada resultado y marca errores antes de ejecutar.

El esquema ya define los tipos de cada fila. Se obtienen así:

```ts
type Cliente = typeof clientes.$inferSelect;      // lo que devuelve un select
type NuevoCliente = typeof clientes.$inferInsert; // lo que acepta un insert
```

En `NuevoCliente`, `id`, `telefono` y `creadoEn` son opcionales porque tienen valor por defecto o aceptan nulos. `nombre` y `email` son obligatorios. Además, `prioridad` solo acepta `'baja'`, `'media'` o `'alta'`, porque el `enum` del esquema sí tiene efecto sobre los tipos.

## Resumen

- Drizzle describe la base en JavaScript; ese esquema es la única fuente de verdad
- `drizzle-orm` arma y ejecuta las consultas; `drizzle-kit` genera y aplica migraciones
- con `@libsql/client`, el mismo código sirve para un archivo SQLite y para Turso, y solo cambia la dirección
- las claves foráneas viven en el esquema y la base las hace cumplir; las relaciones viven en `relations.js` y solo sirven para consultar
- `generate` escribe el SQL de cada cambio, `migrate` lo aplica y `push` es un atajo para prototipos
- la siembra con datos fijos da resultados predecibles; `drizzle-seed` da volumen
- el constructor de consultas sigue la forma del SQL y conviene para listados planos y cálculos
- las consultas relacionales devuelven objetos anidados y convienen para fichas y respuestas de API
- `update` y `delete` sin `where` afectan toda la tabla
- una transacción aplica todo o nada
