# Drizzle + SQLite + Turso

Proyecto mínimo en Node.js para usar una base de datos con **Drizzle ORM**.

- En **local** la base es un archivo SQLite (`local.db`).
- En **Turso** la base está en la nube.
- El código es el mismo en los dos casos: solo cambia el archivo `.env`.

## Qué es cada herramienta

| Herramienta      | Para qué sirve                                                     |
| ---------------- | ------------------------------------------------------------------ |
| `drizzle-orm`    | Escribir consultas en TypeScript en lugar de SQL a mano.           |
| `drizzle-kit`    | Crear o actualizar las tablas a partir del esquema.                |
| `@libsql/client` | Conectarse a la base. Funciona con un archivo SQLite y con Turso.  |
| `tsx`            | Ejecutar archivos `.ts` directamente, sin compilar.                |

## Paso 1. Crear el proyecto e instalar dependencias

```bash
npm init -y
npm pkg set type=module
npm install drizzle-orm @libsql/client
npm install -D drizzle-kit tsx
```

`type=module` permite usar `import` y `await` en el nivel superior del archivo.

## Paso 2. Archivos del proyecto

```
orm-cc/
├── .env               ← dirección de la base (y token de Turso)
├── .gitignore         ← evita subir .env, la base local y node_modules
├── schema.ts          ← definición de las tablas
├── db.ts              ← conexión a la base
├── drizzle.config.ts  ← configuración de drizzle-kit
└── index.ts           ← ejemplo: insertar y listar
```

### `.env`

```
TURSO_DATABASE_URL=file:local.db
```

`file:local.db` significa “usar el archivo `local.db` de esta carpeta”.

### `schema.ts`: la tabla

En clase partimos de un `schema.ts` vacío, que solo tiene un `TODO`. Este es el código que vamos a escribir:

```ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const alumnos = sqliteTable("alumnos", {
  id: integer().primaryKey({ autoIncrement: true }),
  nombre: text().notNull(),
  email: text().notNull(),
});
```

### `db.ts`: la conexión

```ts
import { drizzle } from "drizzle-orm/libsql";

process.loadEnvFile();

export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

`process.loadEnvFile()` lee el archivo `.env`. Viene incluido en Node, así que no hace falta instalar `dotenv`.

### `drizzle.config.ts`: configuración de drizzle-kit

```ts
import { defineConfig } from "drizzle-kit";

process.loadEnvFile();

export default defineConfig({
  dialect: "turso",
  schema: "./schema.ts",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

El dialecto `turso` sirve también para el archivo local.

### `index.ts`: el ejemplo

```ts
import { db } from "./db";
import { alumnos } from "./schema";

await db.insert(alumnos).values({ nombre: "Ana", email: "ana@mail.com" });

const lista = await db.select().from(alumnos);
console.table(lista);
```

### Scripts en `package.json`

```json
"scripts": {
  "dev": "tsx index.ts",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

## Paso 3. Probar en local

1. Crear la tabla en la base:

   ```bash
   npm run db:push
   ```

2. Ejecutar el ejemplo:

   ```bash
   npm run dev
   ```

   Resultado esperado:

   ```
   ┌─────────┬────┬────────┬────────────────┐
   │ (index) │ id │ nombre │ email          │
   ├─────────┼────┼────────┼────────────────┤
   │ 0       │ 1  │ 'Ana'  │ 'ana@mail.com' │
   └─────────┴────┴────────┴────────────────┘
   ```

   Cada vez que se ejecuta agrega una fila más: los datos quedan guardados en `local.db`.

3. (Opcional) Ver los datos en el navegador:

   ```bash
   npm run db:studio
   ```

## Paso 4. Pasar a Turso

1. Iniciar sesión (una sola vez):

   ```bash
   turso auth login
   ```

2. Crear la base:

   ```bash
   turso db create orm-cc
   ```

3. Obtener la URL:

   ```bash
   turso db show orm-cc --url
   ```

4. Crear un token:

   ```bash
   turso db tokens create orm-cc
   ```

5. Cambiar el `.env` con esos dos datos:

   ```
   TURSO_DATABASE_URL=libsql://orm-cc-usuario.turso.io
   TURSO_AUTH_TOKEN=eyJ...
   ```

6. Crear la tabla en Turso y probar, igual que en local:

   ```bash
   npm run db:push
   npm run dev
   ```

## Paso 5. Mini CRM: esquemas

Reemplazamos la tabla `alumnos` por dos tablas:

- **clientes**: nombre, apellido, teléfono (opcional) y email (único).
- **actividades**: cada actividad pertenece a un cliente. Puede tener una fecha de compromiso y puede estar completa o pendiente.

```ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer().primaryKey({ autoIncrement: true }),
  nombre: text().notNull(),
  apellido: text().notNull(),
  telefono: text(),
  email: text().notNull().unique(),
});

export const actividades = sqliteTable("actividades", {
  id: integer().primaryKey({ autoIncrement: true }),
  clienteId: integer().notNull().references(() => clientes.id),
  descripcion: text().notNull(),
  fechaCompromiso: integer({ mode: "timestamp" }),
  completada: integer({ mode: "boolean" }).notNull().default(false),
});
```

### Cómo se lee cada parte

| Código                                        | Significado                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| `.notNull()`                                  | El campo es obligatorio.                                                       |
| Sin `.notNull()` (como `telefono`)            | El campo es opcional: puede quedar vacío (`null`).                             |
| `.unique()`                                   | No puede haber dos clientes con el mismo email.                                |
| `.references(() => clientes.id)`              | `clienteId` debe ser el `id` de un cliente que exista.                         |
| `integer({ mode: "timestamp" })`              | Guarda una fecha. En el código se usa como `Date`.                             |
| `integer({ mode: "boolean" })`                | Guarda verdadero o falso. En el código se usa como `true` o `false`.           |
| `.default(false)`                             | Si no se indica, la actividad se crea como pendiente.                          |

SQLite no tiene tipos para fechas ni para booleanos. Por eso se guardan como números y Drizzle los convierte al leerlos.

“Un cliente tiene una lista de actividades” se resuelve con `clienteId`. Cada actividad guarda a qué cliente pertenece.

### Regla que no está en el esquema

“La fecha de compromiso debe ser futura” no se puede controlar en el esquema, porque SQLite no permite usar la fecha actual en una restricción. Hay que validarlo en el código, al crear o modificar una actividad.

### Aplicar los cambios

```bash
npm run db:push
```

Este es el SQL que genera Drizzle:

```sql
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`apellido` text NOT NULL,
	`telefono` text,
	`email` text NOT NULL
);
CREATE UNIQUE INDEX `clientes_email_unique` ON `clientes` (`email`);

CREATE TABLE `actividades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clienteId` integer NOT NULL,
	`descripcion` text NOT NULL,
	`fechaCompromiso` integer,
	`completada` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`)
);
```

Para ver el SQL antes de aplicarlo: `npx drizzle-kit push --verbose`.

## Cuidado

- **No dejar `TURSO_AUTH_TOKEN=` vacío.** En local esa línea no debe existir. Si queda vacía, `drizzle-kit push` falla con el mensaje `Please provide required params`.
- **No subir `.env` a GitHub.** Contiene el token de Turso. Por eso está en `.gitignore`.
- **Si se cambia `schema.ts`**, volver a ejecutar `npm run db:push` para actualizar las tablas.
