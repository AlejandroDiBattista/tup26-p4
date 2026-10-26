# MiniCRM

Demostración didáctica: Node.js, TypeScript, Drizzle, SQLite/Turso, Express, React y MCP. Los doce pasos de `prompts-demo.md` están registrados en [tareas.md](tareas.md).

## Instalar y ejecutar

Requiere Node.js 22 o posterior y npm. Ejecuta todo desde esta carpeta:

```sh
npm ci
cp .env.example .env
npm run db:migrate
npm run db:seed
npm start
```

- REST: <http://localhost:3100/clientes.html>
- MCP: <http://localhost:3100/clientes-mcp.html>
- Endpoint MCP: <http://localhost:3100/mcp>

El puerto predeterminado es 3100; se configura con `PORT`. El servidor escucha en `127.0.0.1` por defecto. Ambas páginas usan la misma base persistente `minicrm.db`. La semilla crea 10 clientes ficticios y 50 actividades, con compromisos sin fecha, vencidos, de hoy y futuros. Repetirla conserva los datos existentes y no duplica registros. Los vencimientos de la semilla se calculan al cargarla por primera vez.

Cada HTML contiene su CSS, JSX y adaptador de transporte. React 18.3.1, ReactDOM 18.3.1 y Babel 7.26.9 se cargan desde jsDelivr; se necesita conexión para esas bibliotecas. Babel usa explícitamente `runtime: 'classic'` y React global. Se usa React por la indicación específica de los pasos 5 y 11 de la demostración.

## Estructura

```text
src/
  esquema.ts        Tablas y tipos inferidos de Drizzle
  base.ts           Conexión SQLite local o Turso
  migrar.ts         Aplicación de migraciones
  semilla.ts        Datos ficticios sin duplicados
  validacion.ts     Esquemas de entrada y calendario de Tucumán
  errores.ts        Errores compartidos
  clientes.ts       Servicio Clientes con métodos estáticos
  controladores.ts  Adaptación HTTP, sin reglas de negocio
  rutas.ts          Rutas REST
  mcp.ts            Herramientas MCP que llaman al mismo servicio
  app.ts            Aplicación Express
  servidor.ts       Inicio y cierre
public/
  clientes.html
  clientes-mcp.html
drizzle/            Migración SQL y metadatos
pruebas/            Pruebas de integración con base temporal
```

## Datos y reglas

Los campos del cliente son `id`, `nombre`, `apellido`, `email` único y `telefono` opcional. Se quitan espacios sobrantes, se normalizan nombres y emails y se convierten teléfonos argentinos con código de área a formato internacional E.164. Los teléfonos inválidos se rechazan.

Las actividades pertenecen obligatoriamente a un cliente y se eliminan con él, incluso si están completadas. Sus campos son `id`, `clienteId`, `descripcion`, `fecha`, `fechaCompromiso` y `fechaFinalizacion`. Fecha y compromiso usan `AAAA-MM-DD` o `null`; finalización es un instante ISO 8601 UTC, asignado por el servidor y mostrado en Tucumán. Un compromiso vence cuando su fecha es anterior al día actual en `America/Argentina/Tucuman`. Hoy no está vencido. Las completadas no se editan ni borran individualmente; completar otra vez conserva el instante original.

`Clientes.buscar(texto)` busca en todos los campos del cliente, incluido el id, sin distinguir mayúsculas ni acentos. Para mantener el ejemplo simple, filtra en JavaScript tras obtener la lista: está pensado para una demostración pequeña.

## API REST

Prefijo: `/api/clientes`. Los cuerpos son JSON. Altas: `201` y cabecera `Location`; lecturas y cambios: `200`; borrados: `204`. Errores: `{ "error": "mensaje" }`, con `400` para entradas inválidas, `404` para inexistentes, `409` para email repetido o modificación de una completada y `500` para errores inesperados.

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | `/api/clientes?texto=acosta` | Listar o buscar por cualquier campo |
| GET | `/api/clientes?email=cliente1@example.com` | Buscar email exacto; devuelve lista de cero o un elemento |
| POST | `/api/clientes` | Crear cliente |
| GET / PATCH / DELETE | `/api/clientes/:clienteId` | Obtener, actualizar parcialmente o eliminar |
| GET | `/api/clientes/:clienteId/actividades?filtro=todas` | Listar; filtros: `todas`, `pendientes`, `vencidas`, `sin-compromiso` |
| POST | `/api/clientes/:clienteId/actividades` | Crear actividad |
| GET / PATCH / DELETE | `/api/clientes/:clienteId/actividades/:actividadId` | Obtener, editar pendiente o borrar pendiente |
| POST | `/api/clientes/:clienteId/actividades/:actividadId/completar` | Completar |

```sh
curl http://localhost:3100/api/clientes
curl -X POST http://localhost:3100/api/clientes \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","apellido":"Pérez","email":"ana@example.com"}'
curl -X POST http://localhost:3100/api/clientes/1/actividades \
  -H 'Content-Type: application/json' \
  -d '{"descripcion":"Enviar propuesta","fechaCompromiso":"2026-10-20"}'
```

## Conectar un cliente MCP

Servidor implementado con el [SDK oficial de MCP](https://ts.sdk.modelcontextprotocol.io/server), transporte **Streamable HTTP**, sin sesiones, con respuestas JSON. Configura un cliente compatible con URL `http://localhost:3100/mcp` y transporte HTTP. No usa el antiguo transporte HTTP+SSE ni stdio.

Un cliente inicia con `initialize`, negocia la versión y envía `notifications/initialized`; luego usa `tools/list` y `tools/call`. Enviar `Content-Type: application/json` y `Accept: application/json, text/event-stream`, y tras inicializar `MCP-Protocol-Version` con la versión negociada. `clientes-mcp.html` muestra la implementación completa en el navegador. GET y DELETE de `/mcp` devuelven `405` porque no hay canal SSE ni sesión que cerrar.

Herramientas disponibles:

| Herramienta | Argumentos |
| --- | --- |
| `clientes_buscar` | `texto` opcional, vacío lista todos |
| `clientes_buscar_email` | `email` |
| `clientes_obtener` / `clientes_eliminar` | `clienteId` |
| `clientes_crear` | `datos: { nombre, apellido, email, telefono? }` |
| `clientes_actualizar` | `clienteId`, `datos` parciales |
| `actividades_listar` | `clienteId`, `filtro` opcional |
| `actividades_obtener` / `actividades_eliminar` / `actividades_completar` | `clienteId`, `actividadId` |
| `actividades_crear` | `clienteId`, `datos: { descripcion, fecha?, fechaCompromiso? }` |
| `actividades_actualizar` | `clienteId`, `actividadId`, `datos` parciales |

Cada herramienta devuelve el dato como JSON en `content[0].text`. Los errores de negocio usan `isError: true` y `{ estado, error }`; los argumentos se validan mediante esquemas Zod publicados por el SDK.

Ejemplo con el SDK instalado:

```ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const cliente = new Client({ name: 'ejemplo', version: '1.0.0' });
await cliente.connect(new StreamableHTTPClientTransport(new URL('http://localhost:3100/mcp')));
console.log(await cliente.callTool({ name: 'clientes_buscar', arguments: { texto: 'Acosta' } }));
await cliente.close();
```

## Turso

La conexión usa el [driver libSQL de Drizzle](https://orm.drizzle.team/docs/get-started/sqlite-new), compatible con SQLite local y Turso. Para usar una base Turso ya creada, configura estas variables en el entorno del servidor:

```dotenv
DATABASE_URL=libsql://nombre-base-organizacion.turso.io
DATABASE_AUTH_TOKEN=token-de-esa-base
```

Ejecuta `npm run db:migrate` contra ese entorno y, solo si quieres los datos ficticios, `npm run db:seed`. No subas `.env` ni tokens al repositorio. La ejecución remota requiere una URL y un token reales; la verificación de esta entrega se realiza sobre SQLite local. La demostración no incluye autenticación de usuarios; antes de exponerla públicamente corresponde proteger el acceso.

## Verificar y desarrollar

```sh
npm run check
npm test
npm run dev
```

Las pruebas usan una base temporal independiente y un puerto libre. Comprueban normalización, búsqueda, email único, fechas válidas, corte del día en Tucumán, composición, CRUD por ambos transportes, inmutabilidad e idempotencia del completado y de la semilla. No modifican `minicrm.db`.

Tras cambiar el esquema: `npm run db:generate` y `npm run db:migrate`. Para comparar las páginas abre ambas URLs y recarga la otra pestaña después de cambiar datos: se comparte la base, sin sincronización automática entre pestañas.
