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

## Reglas de negocio

Toda la lógica vive en la clase `Clientes` (`src/services/ClientesService.ts`), con métodos estáticos:

| Método                                    | Qué hace                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `obtenerTodos(busqueda?)`                 | Lista los clientes; filtra por cualquier campo o por sus actividades     |
| `obtenerPorId(id)`                        | Devuelve el cliente con sus actividades                                  |
| `crear(data)` / `actualizar(id, data)`    | Normaliza y valida los datos; el email debe ser único                    |
| `eliminar(id)`                            | Borra el cliente y todas sus actividades                                 |
| `agregarActividad(clienteId, data)`       | Crea una actividad pendiente                                             |
| `actualizarActividad(id, data)`           | Edita una actividad, solo si está pendiente                              |
| `eliminarActividad(id)`                   | Borra una actividad, solo si está pendiente                              |
| `completarActividad(id)`                  | Guarda la fecha y hora actual como `fecha_finalizacion`                  |

- **Búsqueda:** cada palabra tiene que aparecer en algún campo del cliente o en una actividad. No distingue mayúsculas ni acentos (`garcia` encuentra a "García"), y el teléfono se puede buscar solo con dígitos.
- **Normalización:** nombre y apellido quedan con mayúscula inicial, el email en minúsculas y sin espacios, el teléfono solo con dígitos, espacios, `+`, `-` y paréntesis, y los campos vacíos se guardan como `null`.
- **Errores:** el servicio lanza `NoEncontrado` (404), `DatosInvalidos` (400) o `Conflicto` (409), definidos en `src/services/errores.ts`. Por ejemplo, un email repetido o editar una actividad completada da `Conflicto`.

## API REST

Todas las respuestas son JSON. Los errores tienen la forma `{ "error": "mensaje" }`.

| Método   | Ruta                                     | Body                                                                | Respuesta                      |
| -------- | ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------ |
| `GET`    | `/api/clientes?q=texto`                  | —                                                                   | 200, lista de clientes         |
| `GET`    | `/api/clientes/:id`                      | —                                                                   | 200, cliente con `actividades` |
| `POST`   | `/api/clientes`                          | `nombre`, `apellido`, `email`, `domicilio?`, `localidad?`, `telefono?` | 201, cliente creado         |
| `PUT`    | `/api/clientes/:id`                      | Los campos a modificar                                              | 200, cliente actualizado       |
| `DELETE` | `/api/clientes/:id`                      | —                                                                   | 204                            |
| `POST`   | `/api/clientes/:clienteId/actividades`   | `descripcion`, `fechaCompromiso?` (AAAA-MM-DD)                      | 201, actividad creada          |
| `PUT`    | `/api/actividades/:actividadId`          | `descripcion?`, `fechaCompromiso?`                                  | 200, actividad actualizada     |
| `DELETE` | `/api/actividades/:actividadId`          | —                                                                   | 204                            |
| `PATCH`  | `/api/actividades/:actividadId/completar`| —                                                                   | 200, actividad completada      |

Códigos de error:

- **400**: datos inválidos, JSON mal formado o id que no es un entero positivo.
- **404**: el cliente, la actividad o la ruta no existen.
- **409**: conflicto con el estado actual, como un email repetido o una actividad que ya está completada.
- **500**: error inesperado. Se registra en la consola del servidor.

Ejemplos con `curl`:

```bash
curl "http://localhost:3000/api/clientes?q=garcia"
curl -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" -d "{\"nombre\":\"Lucas\",\"apellido\":\"Ibañez\",\"email\":\"lucas@example.com\"}"
curl -X PATCH http://localhost:3000/api/actividades/2/completar
```

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
│   ├── services/
│   │   ├── ClientesService.ts  Reglas de negocio (clase Clientes)
│   │   └── errores.ts      Errores de negocio con su código HTTP
│   ├── controllers/        Controladores HTTP (clientes, actividades, parámetros)
│   ├── routes/             Routers de Express (montados en /api)
│   ├── middlewares/
│   │   └── errores.ts      404 de la API y manejador global de errores
│   ├── app.ts              Configuración de Express
│   └── index.ts            Punto de entrada
├── drizzle.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```
