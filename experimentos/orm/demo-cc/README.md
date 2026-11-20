# demo

Node.js + TypeScript + [Drizzle ORM](https://orm.drizzle.team). SQLite local en desarrollo y [Turso](https://turso.tech) en producción (ambos mediante `@libsql/client`, así el código es el mismo).

## Estructura

```
src/
  config.ts            # variables de entorno
  db/
    schema.ts          # tablas
    client.ts          # createDb(url, authToken)
    migrate.ts         # runMigrations(db)
    seed.ts            # carga idempotente de datos de ejemplo
    seed-data.ts       # 10 clientes ficticios con actividades
  clientes/clientes.routes.ts, clientes.controller.ts  # rutas y controlador
  clientes/clientes.ts    # servicio: clase Clientes (CRUD de clientes y actividades)
  clientes/normalizar.ts  # normalización de nombres, emails, teléfonos y fechas
  app.ts               # aplicación Express
  mcp/                 # servidor MCP (herramientas y ruta /mcp)
  index.ts             # arranque del servidor
  http/                # manejo de errores y utilidades HTTP
  actividades/         # rutas y controlador de actividades
public/clientes.html   # interfaz web (React por CDN)
tests/                 # pruebas (SQLite en memoria)
drizzle/               # migraciones generadas
```

## Instalación

Requiere Node.js 20 o superior.

```bash
npm install
npm run db:migrate   # crea local.db y aplica las migraciones
npm run db:seed      # carga 10 clientes de ejemplo (se puede repetir sin duplicar)
```

Sin variables de entorno se usa `file:local.db`. Opcionalmente copia `.env.example` a `.env`.

## Ejecución

```bash
npm run dev          # desarrollo con recarga
npm run build && npm start   # producción (compilado)
```

## Modelo

- `clientes`: id, nombre, apellido, email (único); opcionales: domicilio, localidad, teléfono.
- `actividades` (1:n, se eliminan junto con su cliente): id, descripción; opcionales: `fechaCompromiso` (null = sin fecha) y `fechaFinalizacion` (solo se llena al completar). Las fechas son texto `YYYY-MM-DD`.

El seed es idempotente: los clientes se identifican por email y las actividades por (cliente, descripción).

## Servicio `Clientes`

Clase con métodos estáticos (`src/clientes/clientes.ts`). Se conecta una vez con `Clientes.conectar(db)`.

```ts
Clientes.conectar(createDb(config.databaseUrl, config.authToken));

const c = await Clientes.crear({ nombre: "ana", apellido: "paz", email: "ANA@x.com" });
await Clientes.buscar({ localidad: "rosario", telefono: "341" }); // parcial, cualquier campo
await Clientes.buscar({ q: "paz" });                              // en todos los campos de texto
await Clientes.actualizar(c.id, { telefono: "(341) 555-0101" });

const a = await Clientes.crearActividad(c.id, { descripcion: "Llamar" });
await Clientes.buscarActividades({ estado: "vencida" });
await Clientes.completarActividad(a.id, "2026-10-16");           // fecha de ejecución (hoy por defecto)
```

Reglas:
- **Estado de una actividad**: `completada` (tiene fecha de finalización), `vencida` (compromiso anterior a hoy y sin completar) o `pendiente` (sin fecha, o con fecha de hoy en adelante).
- Una actividad completada no se puede editar, completar de nuevo ni eliminar individualmente; solo desaparece al eliminar su cliente.
- Al guardar se normalizan: nombres y apellidos (espacios y mayúsculas iniciales), emails (minúsculas) y teléfonos (solo dígitos, con `+` inicial si lo hay).
- Las búsquedas de texto son por coincidencia parcial; SQLite ignora mayúsculas solo en letras ASCII, por lo que `ñ`/tildes deben coincidir en mayúscula/minúscula (los nombres se guardan en formato título).

## Interfaz web

Con `npm run dev` abre <http://localhost:3000/clientes> (`public/clientes.html`, servida por Express). Es una página autocontenida: React 18.3.1 y Babel standalone 7.26.4 desde CDN (versiones fijas), JSX embebido compilado con el preset `react` en runtime `classic` (usa el `React` global) y CSS puro. Permite buscar, crear, editar y eliminar clientes, y agregar, editar, completar y eliminar sus actividades (las completadas no se editan ni se borran). Requiere conexión a internet para cargar las bibliotecas.

## API REST

`npm run dev` levanta Express en `http://localhost:3000` (puerto configurable con `PORT`).

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes` | Lista; filtros: `nombre`, `apellido`, `email`, `domicilio`, `localidad`, `telefono`, `q` |
| POST | `/api/clientes` | Crea (acepta `actividades: [...]`) → 201 |
| GET / PATCH / DELETE | `/api/clientes/:id` | Obtiene, actualiza parcialmente, elimina (204) |
| GET | `/api/clientes/:clienteId/actividades` | Lista; filtros: `descripcion`, `estado`, `compromisoDesde/Hasta`, `finalizacionDesde/Hasta` |
| POST | `/api/clientes/:clienteId/actividades` | Crea → 201 |
| GET / PATCH / DELETE | `/api/clientes/:clienteId/actividades/:id` | Obtiene, actualiza, elimina (204) |
| POST | `/api/clientes/:clienteId/actividades/:id/completar` | Completa; cuerpo opcional `{ "fecha": "YYYY-MM-DD" }` (hoy por defecto) |

```bash
curl localhost:3000/api/clientes?localidad=rosario
curl -X POST localhost:3000/api/clientes/1/actividades/2/completar
```

Errores en JSON `{ "error": "..." }`: `400` datos inválidos, `404` no existe (o la actividad no pertenece al cliente), `409` duplicado o actividad completada (no se edita ni se borra).

Capas: `*.routes.ts` (rutas) → `*.controller.ts` (HTTP: parámetros y respuestas) → `Clientes` (reglas de negocio, que lanza `ErrorNoEncontrado`, `ErrorValidacion` o `ErrorConflicto`; `src/http/errores.ts` los traduce a códigos HTTP).

## Usar MCP desde la página

En `http://localhost:3000/clientes`, el selector **REST | MCP** (arriba a la izquierda, bajo el título) elige cómo habla la página con el servidor. La opción se recuerda en el navegador. La funcionalidad y el aspecto son idénticos en ambos modos.

- **REST** usa `/api/clientes` con `fetch`.
- **MCP** usa el módulo embebido `McpModulo` (un `<script>` aparte dentro de `public/clientes.html`): cliente mínimo de MCP por Streamable HTTP contra `/mcp`. Hace el *handshake* (`initialize` + `notifications/initialized`) en la primera llamada y después invoca las herramientas con `tools/call`. Expone las mismas funciones que los servicios REST, por lo que la aplicación los intercambia sin cambios. Los errores de negocio de las herramientas (`isError`) se muestran con su mensaje, igual que en REST.

Para conectarse solo hace falta tener el servidor en marcha (`npm run dev`) y elegir **MCP**; no requiere configuración ni dependencias extra, porque la página y `/mcp` comparten origen. Si el servidor no responde, el error aparece sobre la lista.

## Servidor MCP

Endpoint `http://localhost:3000/mcp` ([SDK oficial](https://github.com/modelcontextprotocol/typescript-sdk), transporte Streamable HTTP, modo sin estado: solo `POST`; `GET`/`DELETE` responden 405). Usa la misma clase `Clientes` y la misma base que la API REST, así que aplica las mismas reglas (normalización, composición cliente→actividades, completadas inalterables).

| Herramienta | Descripción |
|---|---|
| `buscar_clientes` | Filtros por campo (parciales) y `q` libre o por id (`#12`) |
| `obtener_cliente` | Cliente con sus actividades y estado |
| `crear_cliente` | Con actividades iniciales opcionales (todo o nada) |
| `actualizar_cliente` | Solo los campos indicados |
| `eliminar_cliente` | Borra también todas sus actividades |
| `buscar_actividades` | Por `clienteId`, texto, `estado` y rangos de fecha |
| `crear_actividad` | Siempre dentro de un cliente |
| `actualizar_actividad` | Solo si no está completada |
| `completar_actividad` | Fecha de ejecución opcional (hoy por defecto) |
| `eliminar_actividad` | Solo si no está completada |

Los esquemas de entrada se validan con Zod (fechas `YYYY-MM-DD`, ids enteros positivos). Los errores de negocio se devuelven como resultado con `isError: true` y un mensaje claro: `No encontrado: …`, `Datos inválidos: …` u `Operación no permitida: …` (duplicados o actividad completada). Las actividades se identifican por `clienteId` + `id`; si no pertenecen a ese cliente se responde «No encontrado».

**Conexión**

```bash
# Claude Code
claude mcp add --transport http clientes http://localhost:3000/mcp

# Inspector oficial
npx @modelcontextprotocol/inspector   # Transport: Streamable HTTP, URL: http://localhost:3000/mcp
```

Otros clientes (por ejemplo, un `.mcp.json`):

```json
{ "mcpServers": { "clientes": { "type": "http", "url": "http://localhost:3000/mcp" } } }
```

Prueba rápida con `curl`:

```bash
curl -s -X POST http://localhost:3000/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"buscar_clientes","arguments":{"q":"rosario"}}}'
```

> El endpoint no tiene autenticación: está pensado para uso local. Si lo expones en producción, ponle autenticación o una red privada delante.

## Cambios en el esquema

Edita `src/db/schema.ts`, y luego:

```bash
npm run db:generate  # genera la migración en drizzle/
npm run db:migrate   # la aplica
```

## Producción con Turso

```bash
turso db create mi-base
turso db show mi-base --url
turso db tokens create mi-base
```

Define en el entorno de producción:

```
NODE_ENV=production
DATABASE_URL=libsql://mi-base-mi-org.turso.io
DATABASE_AUTH_TOKEN=<token>
```

Aplica las migraciones contra Turso con `npm run db:migrate` (con esas variables) y arranca con `npm start`. En producción `DATABASE_URL` es obligatorio.

## Pruebas

```bash
npm test             # Vitest, usa SQLite en memoria
npm run typecheck
```
