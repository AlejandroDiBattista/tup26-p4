# MiniCRM

Mini CRM para gestionar clientes y sus actividades.
API REST con **Node.js + TypeScript + Express**, persistencia con **Drizzle ORM + SQLite** e interfaz web en **React** (`public/MiniCRM.html`).

## Requisitos

- Node.js 20.12 o superior (probado con Node 22)
- npm

## Instalación

```bash
npm install
npm run setup
```

`npm run setup` ejecuta tres pasos:

1. `npm run db:init`: crea `.env` a partir de `.env.example` (si no existe) y verifica la conexión a la base.
2. `npm run db:push`: crea o actualiza las tablas según `src/db/schema.ts`.
3. `npm run db:seed`: vacía las tablas y carga 10 clientes de ejemplo con sus actividades.

## Modelo de datos

**clientes**: `id`, `nombre`, `apellido`, `email` (único), `domicilio`, `localidad`, `telefono`.

**actividades** (N por cliente): `id`, `cliente_id` (FK a `clientes`, se borran en cascada con el cliente), `descripcion`, `fecha_compromiso`, `fecha_finalizacion`.

Las fechas se guardan como texto ISO 8601. Una actividad está **pendiente** mientras `fecha_finalizacion` sea nula, y **completada** cuando tiene valor.

## Datos de ejemplo

`npm run db:seed` se puede ejecutar todas las veces que quieras: borra todo, reinicia los ids y vuelve a cargar los mismos datos, sin duplicar nada. Las fechas se calculan a partir del día de hoy, así siempre hay actividades completadas, pendientes futuras, pendientes vencidas y pendientes sin fecha.

## Configuración (`.env`)

| Variable             | Descripción                                             | Valor por defecto     |
| -------------------- | ------------------------------------------------------- | --------------------- |
| `PORT`               | Puerto del servidor                                     | `3000`                |
| `DB_FILE`            | Archivo SQLite local (driver `better-sqlite3`)          | `./data/minicrm.db`   |
| `TURSO_DATABASE_URL` | URL de Turso. Si tiene valor, se usa en lugar de SQLite | (vacío)               |
| `TURSO_AUTH_TOKEN`   | Token de Turso                                          | (vacío)               |

Sin `TURSO_DATABASE_URL` la app trabaja con un archivo SQLite local; con ella, se conecta a Turso mediante `@libsql/client`. El resto del código no cambia.

## Ejecución

Desarrollo (recarga automática):

```bash
npm run dev
```

Producción:

```bash
npm run build
npm start
```

Después abrir <http://localhost:3000> (sirve `public/MiniCRM.html`).

## Pruebas

Verificar tipos:

```bash
npm run typecheck
```

Verificar que la API responda (con el servidor levantado):

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada: `{"ok":true}`.

Explorar la base de datos en el navegador:

```bash
npm run db:studio
```

## Scripts

| Script              | Qué hace                                         |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Levanta el servidor con `tsx` en modo watch      |
| `npm run build`     | Compila TypeScript a `dist/`                     |
| `npm start`         | Ejecuta la versión compilada                     |
| `npm run typecheck` | Chequea tipos sin generar archivos               |
| `npm run db:init`   | Crea `.env` si falta y prueba la conexión        |
| `npm run db:push`   | Sincroniza el esquema con la base                |
| `npm run db:seed`   | Vacía la base y carga los datos de ejemplo       |
| `npm run db:studio` | Abre Drizzle Studio                              |
| `npm run setup`     | `db:init` + `db:push` + `db:seed`                |

## Estructura

```
.
├── public/
│   └── MiniCRM.html        Interfaz React (CDN, JSX embebido)
├── src/
│   ├── config/
│   │   ├── env.ts          Lectura de variables de entorno
│   │   └── database.ts     Conexión Drizzle (SQLite local o Turso)
│   ├── db/
│   │   ├── schema.ts       Esquema de tablas
│   │   ├── init.ts         Script de inicialización
│   │   └── seed.ts         Carga de datos de ejemplo
│   ├── services/           Reglas de negocio (clase Clientes)
│   ├── controllers/        Controladores HTTP
│   ├── routes/             Routers de Express
│   ├── app.ts              Configuración de Express
│   └── index.ts            Punto de entrada
├── drizzle.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```
