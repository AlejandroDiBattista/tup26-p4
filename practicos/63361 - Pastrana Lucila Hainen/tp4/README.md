# MiniCRM

Mini CRM para gestionar clientes y sus actividades, hecho con **Node.js + TypeScript + Express + Drizzle ORM + SQLite (Turso)**,
con una interfaz web en **React** (`public/MiniCRM.html`) y un **servidor MCP** (Model Context Protocol) que expone las mismas operaciones.

## Puesta en marcha

```bash
npm install
npm run db:setup   # crea las tablas (drizzle-kit push) y carga 10 clientes de ejemplo
npm run dev        # servidor en http://localhost:3000 (se reinicia al guardar)
```

| URL | Qué es |
|---|---|
| http://localhost:3000/MiniCRM.html | Interfaz web |
| http://localhost:3000/api/clientes | API REST |
| http://localhost:3000/mcp | Servidor MCP (Streamable HTTP) |

Otros scripts: `npm start` (sin recarga), `npm run db:seed` (no duplica datos), `npm run db:studio`, `npm run typecheck`.

**Base de datos:** sin configuración usa el archivo local `minicrm.db`. Para usar Turso en producción, copiar `.env.example`
a `.env` y completar `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.

## Arquitectura

```
                    ┌──────────────── public/MiniCRM.html (React) ────────────────┐
                    │  selector en la barra:  [ API REST ]  [ Servidor MCP ]       │
                    └───────────┬──────────────────────────────────┬──────────────┘
                         fetch /api/...                     JSON-RPC POST /mcp
                                │                                  │
  src/routes ──► src/controllers (HTTP)                 src/mcp (tools MCP)
                                │                                  │
                                └──────────► src/services/clientes.service.ts ◄──┘
                                              clase Clientes: reglas de negocio,
                                              normalización y validaciones
                                                         │
                                              src/db (Drizzle) ──► SQLite / Turso
```

- **`src/services/clientes.service.ts`**: única fuente de reglas de negocio. La usan por igual la API REST, el servidor MCP y el seed.
  - Normaliza nombres (`juan PEREZ` → `Juan Perez`), emails (minúsculas) y teléfonos (solo dígitos y `+`).
  - Búsqueda flexible por cualquier campo, sin distinguir acentos ni mayúsculas.
  - Las actividades completadas no se pueden editar ni eliminar individualmente.
  - Una actividad está **vencida** si está pendiente y su fecha de compromiso es anterior a hoy.
- **`src/routes` + `src/controllers`**: API REST. Los controladores solo traducen HTTP ↔ servicio.
- **`src/mcp`**: servidor MCP. Cada tool llama al mismo método del servicio.
- **`src/middlewares/errores.ts`**: errores JSON estándar `{ error: { status, tipo, mensaje } }` (400, 404, 409, 500).

```
src/
├── app.ts / index.ts         Express: estáticos, /api, /mcp y errores
├── db/                       schema.ts, conexión (index.ts) y seed.ts
├── services/                 clientes.service.ts, normalizar.ts, errores.ts
├── controllers/ routes/      API REST
├── middlewares/errores.ts
└── mcp/                      server.ts (tools) y router.ts (transporte HTTP)
public/MiniCRM.html           Interfaz web (React desde CDN)
```

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes?q=texto` | Busca en todos los campos (`?localidad=...` filtra por campo) |
| POST | `/api/clientes` | Crea un cliente |
| GET | `/api/clientes/:id` | Ficha con sus actividades |
| PUT | `/api/clientes/:id` | Modifica un cliente |
| DELETE | `/api/clientes/:id` | Elimina el cliente y sus actividades |
| GET | `/api/clientes/:clienteId/actividades` | Actividades del cliente |
| POST | `/api/clientes/:clienteId/actividades` | Crea una actividad |
| PUT | `/api/clientes/:clienteId/actividades/:actividadId` | Edita una actividad pendiente |
| PATCH | `/api/clientes/:clienteId/actividades/:actividadId/completar` | La marca como completada (`{ "fecha": "YYYY-MM-DD" }` opcional) |
| DELETE | `/api/clientes/:clienteId/actividades/:actividadId` | Elimina una actividad pendiente |

## Servidor MCP

Implementado con el SDK oficial `@modelcontextprotocol/sdk`, transporte **Streamable HTTP** en `POST /mcp`, en modo
**sin estado** (stateless): no hay sesiones, cada petición crea su servidor y transporte, y los datos viven en la base.
`GET` y `DELETE /mcp` responden `405`.

### Tools

| Tool | Argumentos | Servicio |
|---|---|---|
| `buscar_clientes` | `q?`, o filtros por campo (`nombre?`, `localidad?`, ...) | `Clientes.buscar` |
| `obtener_cliente` | `id` | `Clientes.obtener` |
| `crear_cliente` | `nombre`, `apellido`, `email`, `domicilio?`, `localidad?`, `telefono?` | `Clientes.crear` |
| `actualizar_cliente` | `id` + campos a cambiar | `Clientes.actualizar` |
| `eliminar_cliente` | `id` | `Clientes.eliminar` |
| `listar_actividades` | `clienteId` | `Clientes.listarActividades` |
| `crear_actividad` | `clienteId`, `descripcion`, `fechaCompromiso?` | `Clientes.crearActividad` |
| `actualizar_actividad` | `clienteId`, `actividadId`, `descripcion?`, `fechaCompromiso?` | `Clientes.actualizarActividad` |
| `completar_actividad` | `clienteId`, `actividadId`, `fecha?` | `Clientes.completarActividad` |
| `eliminar_actividad` | `clienteId`, `actividadId` | `Clientes.eliminarActividad` |

Los esquemas de entrada se definen con Zod y el SDK los publica como **JSON Schema** en `tools/list`
(tipos, obligatorios, ids enteros positivos, email válido y fechas `YYYY-MM-DD`). Las tools que solo leen tienen la anotación
`readOnlyHint` y las que borran `destructiveHint`.

El resultado de cada tool es un bloque de texto con el JSON devuelto por el servicio.

### Manejo de errores

| Situación | Respuesta |
|---|---|
| Regla de negocio (email repetido, actividad completada, cliente inexistente) | Resultado con `isError: true` y `{ "error": { status, tipo, mensaje } }` |
| Argumentos que no cumplen el esquema | Resultado con `isError: true` y el detalle (`MCP error -32602: Input validation error ...`) |
| Tool inexistente | Resultado con `isError: true` (`MCP error -32602: Tool ... not found`) |
| JSON mal formado | HTTP 400, JSON-RPC `-32700` (Parse error) |
| Error inesperado | JSON-RPC `-32603` (Internal error) |

### Conectarse al servidor MCP

Con el servidor corriendo (`npm run dev`):

**MCP Inspector** (para probar las tools a mano):

```bash
npx @modelcontextprotocol/inspector
```

Elegir transporte *Streamable HTTP*, URL `http://localhost:3000/mcp` y *Connect*.

**Claude Code:**

```bash
claude mcp add --transport http minicrm http://localhost:3000/mcp
```

**Otros clientes MCP** (Claude Desktop, Cursor, VS Code, etc.): agregar un servidor de tipo HTTP con la URL
`http://localhost:3000/mcp`. Si el cliente solo admite servidores locales (stdio), se puede usar el puente `mcp-remote`:

```json
{
  "mcpServers": {
    "minicrm": { "command": "npx", "args": ["mcp-remote", "http://localhost:3000/mcp"] }
  }
}
```

**A mano con `curl`** (el protocolo es JSON-RPC 2.0):

```bash
curl -X POST http://localhost:3000/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"buscar_clientes","arguments":{"q":"tucuman"}}}'
```

### Cliente MCP en la interfaz web

`public/MiniCRM.html` tiene un selector en la barra superior: **API REST** / **Servidor MCP**.
La interfaz es la misma en los dos modos. Solo cambia la capa que usa para hablar con el servidor:

- **API REST**: `fetch` a `/api/...`.
- **Servidor MCP**: un cliente MCP mínimo embebido (`McpCliente`) que habla JSON-RPC 2.0 por `POST /mcp`.
  Hace el `initialize` una sola vez, envía `notifications/initialized` y después usa `tools/call`.
  Acepta respuestas JSON o SSE, y convierte los resultados con `isError` en mensajes de error en pantalla.

Las dos capas tienen la misma interfaz de métodos (`buscarClientes`, `crearActividad`, ...), así que el resto de la UI no
sabe cuál está activa. La elección se recuerda en el navegador.
