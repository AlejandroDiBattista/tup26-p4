# MiniCRM

Proyecto didáctico con Node.js, TypeScript, Drizzle ORM y SQLite. Por defecto usa una base local (`local.db`) y puede conectarse a Turso cambiando variables de entorno.

## Requisitos

- Node.js 22 o superior.

## Instalación

```bash
npm install
```

## Configuración

La configuración se toma de variables de entorno, leídas en `src/configuracion.ts`:

| Variable             | Uso                                        | Valor por defecto |
| -------------------- | ------------------------------------------ | ----------------- |
| `TURSO_DATABASE_URL` | URL de la base (`file:` local o `libsql:`) | `file:local.db`   |
| `TURSO_AUTH_TOKEN`   | Token de acceso de Turso                   | (vacío)           |
| `PORT`               | Puerto del servidor web                    | `3000`            |

Sin archivo `.env` se trabaja con la base local. Para usar Turso:

```bash
cp .env.example .env
turso db show --url <base>          # copiar en TURSO_DATABASE_URL
turso db tokens create <base>       # copiar en TURSO_AUTH_TOKEN
```

## Base de datos

### Modelo

- **Cliente**: `id`, `nombre`, `apellido`, `email` (único) y `telefono` (opcional).
- **Actividad**: `id`, `clienteId`, `descripcion`, `fecha`, `compromiso` y `finalizacion` (las tres opcionales).

Cada cliente compone sus actividades: una actividad pertenece obligatoriamente a un cliente y se elimina con él (`ON DELETE CASCADE`). `fecha` y `compromiso` son fechas de calendario (`AAAA-MM-DD`); `finalizacion` es fecha y hora. Una actividad sin `finalizacion` está **pendiente**; con `finalizacion`, **completada**.

### Preparar la base

```bash
npm run db:migrar     # crea las tablas
npm run db:semilla    # carga 10 clientes ficticios con sus actividades
```

La semilla calcula las fechas en relación con el día actual, de modo que siempre hay compromisos sin fecha, vencidos, de hoy y futuros, además de actividades completadas. Se puede repetir sin duplicar datos: los clientes cuyo email ya existe se omiten.

Si se modifica `src/db/esquema.ts`, generar una nueva migración con `npm run db:generar` y aplicarla con `npm run db:migrar`.

## Servicio de clientes

Toda la lógica de negocio está en `src/servicios/clientes.ts`, en la clase `Clientes` con métodos estáticos. Usa los tipos inferidos de Drizzle (`Cliente`, `NuevoCliente`, `Actividad`, `NuevaActividad`).

```ts
import { Clientes } from './src/servicios/clientes';

const cliente = await Clientes.crear({ nombre: 'ana', apellido: 'LÓPEZ', email: 'Ana@Example.com' });
await Clientes.agregarActividad(cliente.id, { descripcion: 'Llamar', compromiso: '2026-12-01' });
const vencidas = await Clientes.listarActividades(cliente.id, 'vencidas');
```

| Método                                              | Descripción                                          |
| --------------------------------------------------- | ---------------------------------------------------- |
| `listar()`                                          | Todos los clientes, ordenados por apellido y nombre  |
| `obtener(id)`                                       | Un cliente                                           |
| `buscarPorEmail(email)`                             | El cliente con ese email, o `undefined`              |
| `buscar(texto)`                                     | Clientes cuyo nombre, apellido, email o teléfono contiene el texto |
| `crear(datos)`                                      | Alta de cliente                                      |
| `actualizar(id, datos)`                             | Modifica solo los campos recibidos                   |
| `eliminar(id)`                                      | Baja del cliente y de todas sus actividades          |
| `listarActividades(clienteId, filtro)`              | Filtro: `todas`, `pendientes`, `vencidas` o `sin-compromiso` |
| `obtenerActividad(clienteId, actividadId)`          | Una actividad del cliente                            |
| `agregarActividad(clienteId, datos)`                | Alta de actividad pendiente                          |
| `actualizarActividad(clienteId, actividadId, datos)`| Modifica una actividad pendiente                     |
| `eliminarActividad(clienteId, actividadId)`         | Borra una actividad pendiente                        |
| `completarActividad(clienteId, actividadId)`        | Registra la fecha y hora de finalización             |

### Reglas

- Las actividades siempre se manejan dentro de su cliente: una actividad de otro cliente se considera inexistente.
- **Vencida**: pendiente con compromiso anterior a hoy en Tucumán (`America/Argentina/Tucuman`).
- **Sin compromiso**: pendiente sin fecha de compromiso.
- Las actividades completadas no se pueden editar, borrar ni volver a completar; solo desaparecen al eliminar el cliente.
- Al guardar se normalizan los datos:
  - nombres y apellidos: espacios sobrantes y mayúscula inicial (`maría  JOSÉ` → `María José`);
  - email: minúsculas y formato válido; debe ser único;
  - teléfono argentino: formato E.164 con código de área (`0381 15-512-3456` → `+5493815123456`; los celulares llevan el 9);
  - fechas de calendario: formato `AAAA-MM-DD`.
- Los errores se informan con `DatosInvalidos`, `NoEncontrado` o `Conflicto` (`src/servicios/errores.ts`).

## API REST

```bash
npm start      # http://localhost:3000 (el puerto se cambia con PORT)
```

El servidor (`src/servidor.ts`) usa Express. Los routers (`src/api/rutas/`) solo asocian rutas con controladores; los controladores (`src/api/controladores/`) leen la petición, llaman al servicio y arman la respuesta. Las reglas de negocio quedan en el servicio.

### Clientes

| Método   | Ruta                       | Respuesta                                  |
| -------- | -------------------------- | ------------------------------------------ |
| `GET`    | `/api/clientes`            | `200` lista de clientes                    |
| `GET`    | `/api/clientes?q=texto`    | `200` clientes que contienen el texto      |
| `GET`    | `/api/clientes?email=dir`  | `200` lista con el cliente de ese email (o vacía) |
| `GET`    | `/api/clientes/:clienteId` | `200` cliente                              |
| `POST`   | `/api/clientes`            | `201` cliente creado (encabezado `Location`) |
| `PATCH`  | `/api/clientes/:clienteId` | `200` cliente actualizado                  |
| `DELETE` | `/api/clientes/:clienteId` | `204` sin contenido (borra sus actividades) |

### Actividades de un cliente

Prefijo: `/api/clientes/:clienteId/actividades`

| Método   | Ruta                                    | Respuesta                         |
| -------- | --------------------------------------- | --------------------------------- |
| `GET`    | `/`                                     | `200` todas las actividades        |
| `GET`    | `/?estado=pendientes`                   | también `vencidas` y `sin-compromiso` |
| `GET`    | `/:actividadId`                         | `200` actividad                   |
| `POST`   | `/`                                     | `201` actividad creada            |
| `PATCH`  | `/:actividadId`                         | `200` actividad actualizada       |
| `DELETE` | `/:actividadId`                         | `204` sin contenido               |
| `POST`   | `/:actividadId/completar`               | `200` actividad completada        |

### Errores

Todas las respuestas de error tienen la forma `{ "error": "mensaje" }`:

| Estado | Cuándo                                                           |
| ------ | ---------------------------------------------------------------- |
| `400`  | Datos inválidos, JSON mal formado o id no numérico               |
| `404`  | Cliente, actividad o ruta inexistente                            |
| `409`  | Email repetido, o actividad completada que se quiere modificar   |
| `500`  | Error inesperado (el detalle queda en la consola del servidor)   |

### Ejemplos

```bash
curl -X POST localhost:3000/api/clientes -H 'content-type: application/json' \
  -d '{"nombre":"ana","apellido":"lópez","email":"Ana@Example.com","telefono":"0381 15 555-1234"}'

curl -X POST localhost:3000/api/clientes/1/actividades -H 'content-type: application/json' \
  -d '{"descripcion":"Enviar propuesta","compromiso":"2026-12-01"}'

curl -X POST localhost:3000/api/clientes/1/actividades/2/completar
```

## Servidor MCP

El mismo servidor publica en `/mcp` un servidor [MCP](https://modelcontextprotocol.io) con el SDK oficial (`@modelcontextprotocol/sdk`) y transporte **Streamable HTTP**. Las herramientas llaman al mismo servicio `Clientes` que la API REST, así que comparten la base de datos, la composición cliente–actividades y la regla de que las completadas no se modifican.

- Funciona sin estado: cada petición `POST /mcp` crea un servidor y un transporte nuevos, y la respuesta llega como JSON.
- `GET` y `DELETE` responden `405` (no hay sesiones ni flujo de notificaciones).
- Solo acepta peticiones dirigidas a `localhost` (protección contra DNS rebinding).

### Herramientas

| Herramienta                | Argumentos                                                  |
| -------------------------- | ----------------------------------------------------------- |
| `listar_clientes`          | —                                                           |
| `buscar_clientes`          | `texto`                                                     |
| `buscar_cliente_por_email` | `email`                                                     |
| `obtener_cliente`          | `clienteId`                                                 |
| `crear_cliente`            | `nombre`, `apellido`, `email`, `telefono?`                  |
| `actualizar_cliente`       | `clienteId`, `nombre?`, `apellido?`, `email?`, `telefono?`  |
| `eliminar_cliente`         | `clienteId`                                                 |
| `listar_actividades`       | `clienteId`, `estado?` (`todas`, `pendientes`, `vencidas`, `sin-compromiso`) |
| `obtener_actividad`        | `clienteId`, `actividadId`                                  |
| `agregar_actividad`        | `clienteId`, `descripcion`, `fecha?`, `compromiso?`         |
| `actualizar_actividad`     | `clienteId`, `actividadId`, `descripcion?`, `fecha?`, `compromiso?` |
| `eliminar_actividad`       | `clienteId`, `actividadId`                                  |
| `completar_actividad`      | `clienteId`, `actividadId`                                  |

Los argumentos se validan con esquemas de Zod que el cliente recibe en `tools/list`. El resultado de cada herramienta es un texto con el JSON devuelto por el servicio. Los errores de negocio (cliente inexistente, email repetido, actividad completada, datos inválidos) se devuelven con `isError: true` y el mensaje del servicio.

### Conectarse

Con el servidor iniciado (`npm start`):

```bash
# Claude Code
claude mcp add --transport http minicrm http://localhost:3000/mcp

# MCP Inspector: elegir "Streamable HTTP" y la URL http://localhost:3000/mcp
npx @modelcontextprotocol/inspector
```

Para otros clientes, la configuración JSON habitual es:

```json
{
  "mcpServers": {
    "minicrm": { "type": "http", "url": "http://localhost:3000/mcp" }
  }
}
```

Prueba manual con curl (el encabezado `Accept` es obligatorio en Streamable HTTP):

```bash
curl localhost:3000/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"listar_actividades","arguments":{"clienteId":1,"estado":"vencidas"}}}'
```

## Páginas web

Con el servidor iniciado hay dos versiones de la misma aplicación, que trabajan sobre los mismos datos:

| URL                                         | Acceso a datos              |
| ------------------------------------------- | --------------------------- |
| <http://localhost:3000/clientes.html>       | API REST (`/api/clientes`)  |
| <http://localhost:3000/clientes-mcp.html>   | Herramientas MCP (`/mcp`)   |

Lo que se crea o modifica en una página aparece en la otra al recargarla.

`public/clientes.html` es una página autocontenida: React 18, ReactDOM y Babel se cargan desde unpkg con versiones fijas, y el JSX se transforma en el navegador. Babel se configura explícitamente con un preset propio (`react-classic`) que usa el runtime clásico, para que el JSX se convierta en `React.createElement` sobre el `React` global.

- **Maestro**: lista de clientes con búsqueda en vivo (consulta `GET /api/clientes?q=` mientras se escribe) y botón «Agregar cliente».
- **Detalle**: ficha del cliente con su número (`#123`) arriba a la derecha y botón «Editar». El alta y la edición usan un formulario en el mismo lugar; si el guardado falla, se conservan los valores y se muestra el error.
- **Subformulario de compromisos**: debajo de la ficha, en una sola línea, permite cargar una descripción y una fecha de compromiso opcional. Los íconos de lápiz de cada compromiso cargan sus datos ahí para editarlo.
- **Compromisos**: actividades pendientes, primero las que no tienen fecha, luego las vencidas y al final las de hoy o futuras (con fecha, en orden ascendente). Marcar el check las completa; el tacho las borra.
- **Actividades completadas**: de solo lectura, de la más reciente a la más antigua.

La página ocupa toda la ventana: el maestro y la lista de actividades tienen scroll propio, mientras la búsqueda y la ficha quedan siempre visibles. En pantallas angostas el maestro se ubica arriba y el detalle debajo.

### Versión con MCP

`public/clientes-mcp.html` tiene la misma interfaz y el mismo comportamiento. Solo cambia la sección «Acceso a datos»: el objeto `api` expone las mismas funciones, pero en lugar de usar `fetch` contra la API REST, cada una llama a una herramienta MCP. Para comparar ambas páginas:

```bash
diff public/clientes.html public/clientes-mcp.html
```

El cliente MCP del navegador hace, sobre HTTP y en JSON-RPC:

1. `initialize` (una sola vez), con la versión de protocolo `2025-06-18`;
2. la notificación `notifications/initialized`, que el servidor acepta con `202`;
3. `tools/call` por cada operación, enviando los encabezados `Accept: application/json, text/event-stream` y `MCP-Protocol-Version`.

El resultado de la herramienta llega como texto JSON; si `isError` es `true`, el texto es el mensaje de error que muestra la página.

## Scripts

| Script               | Qué hace                                          |
| -------------------- | ------------------------------------------------- |
| `npm start`          | Inicia el servidor web                            |
| `npm run db:generar` | Genera migraciones SQL a partir del esquema       |
| `npm run db:migrar`  | Aplica las migraciones pendientes en la base      |
| `npm run db:semilla` | Carga los datos de ejemplo sin duplicarlos        |
| `npm run db:studio`  | Abre Drizzle Studio para explorar los datos       |
| `npm run tipos`      | Verifica los tipos de TypeScript                  |

## Estructura

```text
drizzle.config.ts         configuración de drizzle-kit
drizzle/                  migraciones SQL generadas
src/configuracion.ts      variables de entorno
src/fechas.ts             fecha de hoy en Tucumán y cálculo de días
src/db/conexion.ts        instancia de Drizzle (cliente libSQL)
src/db/esquema.ts         tablas y tipos inferidos
src/db/semilla.ts         datos de ejemplo
src/servicios/            servicio Clientes, normalización y errores de negocio
src/api/                  controladores, routers y manejo de errores HTTP
src/mcp/                  herramientas MCP y transporte Streamable HTTP
src/servidor.ts           servidor Express (REST, MCP y páginas)
public/clientes.html      página maestro-detalle con React (usa la API REST)
public/clientes-mcp.html  la misma página usando las herramientas MCP
```
