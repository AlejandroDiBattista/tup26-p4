# MiniCRM

Gestión de clientes y sus actividades con **Node.js**, **TypeScript**, **Drizzle ORM** y **SQLite** (local) o **Turso** (producción).

> TP4 — Cuellar Elias Eduardo (58755). Ver [enunciado.md](enunciado.md).

## Requisitos

- Node.js 20.6 o superior (se usa `--env-file-if-exists`).
- npm.

## Instalación

```bash
npm install
```

## Configuración

La conexión se define con variables de entorno. Sin configurar nada, se usa el archivo local `minicrm.db`.

Para personalizarla, copie el ejemplo y edítelo:

```bash
cp .env.example .env
```

| Variable              | Descripción                                               | Por defecto        |
| --------------------- | --------------------------------------------------------- | ------------------ |
| `DATABASE_URL`        | `file:<archivo>.db` (SQLite) o `libsql://...` (Turso)     | `file:minicrm.db`  |
| `DATABASE_AUTH_TOKEN` | Token de Turso. No hace falta en local.                   | —                  |
| `NODE_ENV`            | Con `production`, `DATABASE_URL` pasa a ser obligatoria.  | —                  |

### Producción con Turso

```bash
turso db create minicrm
turso db show minicrm --url        # -> DATABASE_URL
turso db tokens create minicrm     # -> DATABASE_AUTH_TOKEN
```

Cargue esos valores en `.env` (o en las variables del servidor) con `NODE_ENV=production`.

## Base de datos

Crear las tablas y cargar los datos de ejemplo en un solo paso:

```bash
npm run db:setup
```

O por separado:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

El seed carga 10 clientes ficticios con actividades completadas, pendientes con fecha y pendientes sin fecha. Es **idempotente**: puede ejecutarse varias veces sin duplicar datos (los clientes se identifican por `email` y las actividades por cliente + descripción).

Para empezar de cero, borre `minicrm.db` y vuelva a ejecutar `npm run db:setup`.

## Scripts

| Script                | Acción                                                         |
| --------------------- | -------------------------------------------------------------- |
| `npm run db:generate` | Genera una nueva migración en `drizzle/` tras cambiar el esquema. |
| `npm run db:migrate`  | Aplica las migraciones pendientes.                             |
| `npm run db:seed`     | Carga los datos de ejemplo (sin duplicar).                     |
| `npm run db:setup`    | `db:migrate` + `db:seed`.                                      |
| `npm run db:studio`   | Abre Drizzle Studio para explorar la base.                     |
| `npm run typecheck`   | Verifica los tipos con TypeScript (modo estricto).             |

## Modelo de datos

```
clientes 1 ──── N actividades
```

**clientes**

| Campo       | Tipo    | Notas                 |
| ----------- | ------- | --------------------- |
| `id`        | integer | PK autoincremental    |
| `nombre`    | text    | obligatorio           |
| `apellido`  | text    | obligatorio           |
| `email`     | text    | obligatorio, único    |
| `domicilio` | text    | opcional              |
| `localidad` | text    | opcional              |
| `telefono`  | text    | opcional              |

**actividades**

| Campo               | Tipo    | Notas                                                   |
| ------------------- | ------- | ------------------------------------------------------- |
| `id`                | integer | PK autoincremental                                      |
| `clienteId`         | integer | FK a `clientes.id`, se borra en cascada con el cliente  |
| `descripcion`       | text    | obligatoria, única por cliente                          |
| `fechaCompromiso`   | text    | opcional, `YYYY-MM-DD`                                  |
| `fechaFinalizacion` | text    | `null` = pendiente; con valor = completada              |

## Estructura

```
tp4/
├── drizzle/              # Migraciones SQL generadas por drizzle-kit
├── src/
│   ├── config.ts         # Lectura y validación de variables de entorno
│   └── db/
│       ├── schema.ts     # Tablas, relaciones y tipos
│       ├── client.ts     # Conexión (libSQL) e instancia de Drizzle
│       ├── migrate.ts    # Aplica migraciones
│       ├── seed-data.ts  # Datos ficticios
│       └── seed.ts       # Carga idempotente
├── drizzle.config.ts
├── tsconfig.json
└── package.json
```
