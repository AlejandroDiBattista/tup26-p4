# MiniCRM

Gestión de clientes y sus actividades con **Node.js**, **TypeScript**, **Drizzle ORM** y **SQLite** (local) o **Turso** (producción). Se expone como **API REST** (Express) y como **servidor MCP** (Model Context Protocol), y se usa desde una interfaz web en **React**.

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
| `PORT`                | Puerto del servidor HTTP.                                 | `3000`             |
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

## Ejecución

En desarrollo (se reinicia al guardar cambios):

```bash
npm run dev
```

En producción, compilar y ejecutar:

```bash
npm run build
```

```bash
npm start
```

El servidor queda en `http://localhost:3000`: la API REST bajo `/api`, el servidor MCP en `/mcp` y la interfaz web (`public/MiniCRM.html`) en la raíz.

## Scripts

| Script                | Acción                                                         |
| --------------------- | -------------------------------------------------------------- |
| `npm run dev`         | Servidor en modo desarrollo con recarga automática (tsx).      |
| `npm run build`       | Compila TypeScript a `dist/`.                                  |
| `npm start`           | Ejecuta la versión compilada.                                  |
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

## Capa de servicio

Las reglas de negocio viven en la clase `Clientes` ([src/servicios/clientes.ts](src/servicios/clientes.ts)), con métodos estáticos. No conoce HTTP: ante un problema lanza errores de dominio que la API traducirá a un status.

### Clientes

| Método                        | Descripción                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `listar(busqueda?)`           | Lista ordenada por apellido y nombre, con búsqueda flexible.    |
| `obtener(id)`                 | Ficha del cliente con sus actividades (con estado y ordenadas). |
| `crear(datos)`                | Alta con normalización y email único.                           |
| `actualizar(id, cambios)`     | Modifica solo los campos enviados.                              |
| `eliminar(id)`                | Borra el cliente y todas sus actividades.                       |

**Búsqueda:** cada palabra debe aparecer en algún campo, sin distinguir mayúsculas ni acentos (`jose tucuman`). Con `campo:valor` se limita a un campo (`localidad:salta`, `email:gmail`). El teléfono también se encuentra sin separadores (`3815550101`).

### Actividades

| Método                                          | Descripción                                  |
| ----------------------------------------------- | -------------------------------------------- |
| `listarActividades(clienteId)`                  | Actividades del cliente con su estado.       |
| `obtenerActividad(clienteId, id)`               | Una actividad del cliente.                   |
| `agregarActividad(clienteId, datos)`            | Alta (descripción única por cliente).        |
| `actualizarActividad(clienteId, id, cambios)`   | Edita descripción o fecha de compromiso.     |
| `completarActividad(clienteId, id, fecha?)`     | Registra la finalización (hoy por defecto).  |
| `eliminarActividad(clienteId, id)`              | Borra una actividad pendiente.               |

Una actividad que pertenece a otro cliente se trata como inexistente.

Cada actividad se devuelve con `estado`, `completada` y `vencida`:

- **completada:** tiene `fechaFinalizacion`.
- **vencida:** no está completada y su `fechaCompromiso` es anterior a hoy.
- **pendiente:** el resto, incluidas las que no tienen fecha.

Las actividades **completadas no se pueden editar, volver a completar ni borrar individualmente**; solo desaparecen al eliminar su cliente. La regla se aplica en la propia consulta (`WHERE fecha_finalizacion IS NULL`), así que tampoco se rompe con dos operaciones simultáneas.

### Normalización

Se aplica antes de guardar ([src/servicios/normalizar.ts](src/servicios/normalizar.ts)):

| Campo                 | Regla                                                                   | Ejemplo                                        |
| --------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| nombre, apellido      | Espacios recortados, mayúscula inicial, partículas en minúscula         | `maría JOSÉ de la vega` → `María José de la Vega` |
| localidad             | Igual que los nombres                                                   | `san miguel de tucumán` → `San Miguel de Tucumán` |
| email                 | Minúsculas y formato válido                                             | ` Ana@Mail.COM ` → `ana@mail.com`              |
| teléfono              | Separadores unificados con `-`, 6 a 15 dígitos, conserva `+` inicial    | `(381) 555 0101` → `381-555-0101`              |
| descripción           | Espacios recortados y mayúscula inicial                                 | `  enviar   mail ` → `Enviar mail`             |
| fechas                | `AAAA-MM-DD` de un día real; la finalización no puede ser futura        | `2026-02-30` → error                           |

Un campo opcional enviado vacío se guarda como `null`.

### Errores

| Clase               | Código          | Cuándo                                           |
| ------------------- | --------------- | ------------------------------------------------ |
| `ErrorValidacion`   | `VALIDACION`    | Datos con formato inválido o faltantes.          |
| `ErrorNoEncontrado` | `NO_ENCONTRADO` | El cliente o la actividad no existen.            |
| `ErrorConflicto`    | `CONFLICTO`     | Email o descripción repetidos.                   |
| `ErrorReglaNegocio` | `REGLA_NEGOCIO` | Editar, completar o borrar una actividad completada. |

## API REST

Todas las rutas aceptan y devuelven JSON (`Content-Type: application/json`).

### Clientes

| Método           | Ruta                         | Descripción                              | Respuesta |
| ---------------- | ---------------------------- | ---------------------------------------- | --------- |
| `GET`            | `/api/clientes?q=texto`      | Lista; `q` es opcional (ver búsqueda)    | `200`     |
| `POST`           | `/api/clientes`              | Alta                                     | `201` + `Location` |
| `GET`            | `/api/clientes/:clienteId`   | Ficha con sus actividades                | `200`     |
| `PUT` \| `PATCH` | `/api/clientes/:clienteId`   | Modifica los campos enviados             | `200`     |
| `DELETE`         | `/api/clientes/:clienteId`   | Baja del cliente y sus actividades       | `204`     |

### Actividades

| Método           | Ruta                                                | Descripción                            | Respuesta |
| ---------------- | --------------------------------------------------- | -------------------------------------- | --------- |
| `GET`            | `/api/clientes/:clienteId/actividades`              | Lista con estado                       | `200`     |
| `POST`           | `/api/clientes/:clienteId/actividades`              | Alta                                   | `201` + `Location` |
| `GET`            | `/api/clientes/:clienteId/actividades/:id`          | Una actividad                          | `200`     |
| `PUT` \| `PATCH` | `/api/clientes/:clienteId/actividades/:id`          | Edita descripción y/o compromiso       | `200`     |
| `DELETE`         | `/api/clientes/:clienteId/actividades/:id`          | Baja (solo pendientes)                 | `204`     |
| `POST`           | `/api/clientes/:clienteId/actividades/:id/completar`| Completa; body opcional `{ "fechaFinalizacion": "AAAA-MM-DD" }` | `200` |

### Ejemplos

```bash
curl "http://localhost:3000/api/clientes?q=localidad:salta"
```

```bash
curl -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" -d "{\"nombre\":\"ana\",\"apellido\":\"perez\",\"email\":\"Ana@Mail.com\"}"
```

```bash
curl -X POST http://localhost:3000/api/clientes/1/actividades -H "Content-Type: application/json" -d "{\"descripcion\":\"Llamar\",\"fechaCompromiso\":\"2026-11-10\"}"
```

```bash
curl -X POST http://localhost:3000/api/clientes/1/actividades/2/completar
```

### Errores

Todos los errores responden con el mismo formato:

```json
{ "error": { "codigo": "VALIDACION", "mensaje": "El campo apellido es obligatorio", "campo": "apellido" } }
```

| Status | Código               | Causa                                                    |
| ------ | -------------------- | -------------------------------------------------------- |
| `400`  | `VALIDACION`         | Datos faltantes o con formato inválido (incluye ids).    |
| `400`  | `SOLICITUD_INVALIDA` | El cuerpo no es un JSON válido.                          |
| `404`  | `NO_ENCONTRADO`      | El cliente o la actividad no existen.                    |
| `404`  | `RUTA_NO_ENCONTRADA` | La ruta no existe.                                       |
| `409`  | `CONFLICTO`          | Email o descripción de actividad repetidos.              |
| `422`  | `REGLA_NEGOCIO`      | Editar, completar o borrar una actividad completada.     |
| `500`  | `INTERNO`            | Error inesperado (se registra en la consola del servidor). |

## Servidor MCP

El servidor MCP ([src/mcp/servidor.ts](src/mcp/servidor.ts)) usa el SDK oficial `@modelcontextprotocol/sdk` con transporte **Streamable HTTP** en `POST /mcp`. Sus herramientas llaman a la misma clase `Clientes` que la API REST, sobre la misma base de datos: las validaciones, la normalización y las reglas de negocio son exactamente las mismas.

- **Sin estado:** cada `POST` crea su servidor y su transporte, sin sesiones. `GET` y `DELETE` responden `405`.
- **Respuestas JSON** (`enableJsonResponse`) en lugar de stream SSE.
- **Resultados:** el dato va como JSON en `content` (texto para el modelo) y en `structuredContent` (objeto para programas).
- **Errores de negocio:** se devuelven con `isError: true` y `structuredContent.error = { codigo, mensaje, campo? }`, así el modelo puede leerlos y corregir.
- **Anotaciones:** lectura (`readOnlyHint`), escritura y borrado (`destructiveHint`) para que el cliente sepa qué pedir confirmar.

| Herramienta            | Argumentos                                                        | Devuelve                 |
| ---------------------- | ----------------------------------------------------------------- | ------------------------ |
| `listar_clientes`      | `busqueda?`                                                       | `{ clientes }`           |
| `obtener_cliente`      | `clienteId`                                                       | `{ cliente }` con actividades |
| `crear_cliente`        | `nombre`, `apellido`, `email`, `telefono?`, `domicilio?`, `localidad?` | `{ cliente }`       |
| `actualizar_cliente`   | `clienteId` y los campos a cambiar                                | `{ cliente }`            |
| `eliminar_cliente`     | `clienteId`                                                       | `{ eliminado, clienteId }` |
| `listar_actividades`   | `clienteId`                                                       | `{ actividades }`        |
| `agregar_actividad`    | `clienteId`, `descripcion`, `fechaCompromiso?`                    | `{ actividad }`          |
| `actualizar_actividad` | `clienteId`, `actividadId`, `descripcion?`, `fechaCompromiso?`    | `{ actividad }`          |
| `completar_actividad`  | `clienteId`, `actividadId`, `fechaFinalizacion?`                  | `{ actividad }`          |
| `eliminar_actividad`   | `clienteId`, `actividadId`                                        | `{ eliminada, actividadId }` |

### Probarlo

Con el inspector oficial (en *Transport Type* elegir *Streamable HTTP* y la URL `http://localhost:3000/mcp`):

```bash
npx @modelcontextprotocol/inspector
```

O agregarlo a Claude Code:

```bash
claude mcp add --transport http minicrm http://localhost:3000/mcp
```

O directamente con JSON-RPC:

```bash
curl -X POST http://localhost:3000/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"listar_clientes\",\"arguments\":{\"busqueda\":\"localidad:salta\"}}}"
```

## Interfaz web

[public/MiniCRM.html](public/MiniCRM.html) es una página autocontenida que se abre en `http://localhost:3000` con el servidor en marcha. Toda la funcionalidad pasa por el servidor, a elección por la **API REST** o por el **servidor MCP**.

### Conexión REST / MCP

En la barra superior, el selector **Conexión** alterna entre los dos canales; la elección se recuerda en el navegador.

- Ambos canales implementan la misma interfaz (`listarClientes`, `obtenerCliente`, `crearCliente`, …) y se entregan a los componentes por un contexto de React, así que la interfaz no sabe cuál está usando.
- El canal MCP es un cliente JSON-RPC mínimo escrito en la página: hace el handshake `initialize` una vez y luego invoca las herramientas con `tools/call`. Los errores de negocio (`isError`) se muestran igual que los de REST, marcando el campo afectado.
- Al cambiar de canal se vuelven a pedir la lista y la ficha por el nuevo canal.

- **Bibliotecas por CDN con versiones fijas:** React 18.3.1 y ReactDOM 18.3.1 (última versión con build UMD, que expone los globales `React` y `ReactDOM`) y Babel Standalone 7.26.10.
- **JSX embebido:** Babel compila el `<script type="text/babel">` en el navegador con un preset registrado como `runtime: "classic"`, que traduce el JSX a `React.createElement` usando el React global.
- **CSS propio:** sin frameworks ni librerías de componentes.

### Layout

La página ocupa exactamente la altura de la ventana (`100dvh`) y **nunca se desplaza**: cada panel tiene su propio scroll vertical.

- **Maestro (izquierda):** botón *Agregar*, buscador en vivo (consulta la API 250 ms después de dejar de escribir y descarta respuestas viejas) y la lista de clientes con scroll interno.
- **Detalle (derecha):** ficha de lectura con el id `#123` arriba a la derecha y los botones *Editar* y *Eliminar*; debajo, el subformulario de actividades y las listas de actividades con scroll interno.
- **Pantallas angostas (≤ 760 px):** el maestro pasa arriba y el detalle abajo, cada uno con su scroll.

### Clientes

- **Alta y edición en el detalle:** formulario de tres filas (Nombre y Apellido · Email y Teléfono · Domicilio y Localidad) con *Guardar* y *Cancelar* (también `Esc`). Los errores de la API (por ejemplo, un email repetido) se muestran en el formulario y marcan el campo afectado.
- **Eliminar:** pide confirmación indicando cuántas actividades se borran con el cliente; después se selecciona el cliente vecino de la lista.

### Actividades

- **Compromisos:** primero los sin fecha, luego los vencidos (en rojo) y al final los de hoy o futuros; los que tienen fecha, en orden ascendente.
- **Actividades completadas:** con su fecha de finalización, la más reciente primero. Son **inalterables**: no muestran acciones.
- Cada fila muestra un check a la izquierda, la descripción y la fecha (o *Sin fecha*). En los compromisos, el check marca la actividad como completada (con confirmación, porque no se puede deshacer) y hay botones para editar y eliminar.
- **Subformulario** debajo de la ficha, con borde de puntos redondeado y en una sola línea sin etiquetas visibles: descripción, fecha opcional y botones con ícono para guardar y cancelar. Al editar un compromiso, sus datos se cargan aquí y el borde se resalta.

## Estructura

```
tp4/
├── drizzle/              # Migraciones SQL generadas por drizzle-kit
├── public/
│   └── MiniCRM.html      # Interfaz web (React + JSX por CDN)
├── src/
│   ├── index.ts          # Arranque del servidor HTTP
│   ├── app.ts            # Configuración de Express (JSON, API, estáticos, errores)
│   ├── config.ts         # Lectura y validación de variables de entorno
│   ├── api/
│   │   ├── index.ts                  # Router /api
│   │   ├── clientes.routes.ts        # Rutas de clientes
│   │   ├── clientes.controller.ts    # Controladores de clientes
│   │   ├── actividades.routes.ts     # Rutas anidadas de actividades
│   │   ├── actividades.controller.ts # Controladores de actividades
│   │   └── errores.ts                # 404 y traducción de errores a HTTP
│   ├── mcp/
│   │   ├── servidor.ts   # Servidor MCP y sus herramientas
│   │   └── mcp.routes.ts # Transporte Streamable HTTP en /mcp
│   ├── servicios/
│   │   ├── clientes.ts   # Clase Clientes: reglas de negocio de clientes y actividades
│   │   ├── normalizar.ts # Validación y normalización de entradas
│   │   ├── fechas.ts     # Fecha de hoy y validación de fechas ISO
│   │   └── errores.ts    # Errores de dominio
│   └── db/
│       ├── schema.ts     # Tablas, relaciones y tipos
│       ├── client.ts     # Conexión (libSQL) e instancia de Drizzle
│       ├── migrate.ts    # Aplica migraciones
│       ├── seed-data.ts  # Datos ficticios
│       └── seed.ts       # Carga idempotente
├── drizzle.config.ts
├── tsconfig.json         # Configuración estricta (typecheck)
├── tsconfig.build.json   # Compilación a dist/
└── package.json
```

## Informe final

### Métrica de líneas de código

Se cuentan solo los archivos escritos para el proyecto: `src/**/*.ts` y `public/MiniCRM.html`. Quedan **excluidos** las bibliotecas (`node_modules`), la compilación (`dist/`), los archivos de configuración (`package.json`, `package-lock.json`, `tsconfig*.json`, `drizzle.config.ts`, `.env.example`, `.gitignore`), la migración SQL generada por drizzle-kit (`drizzle/`) y la documentación.

*Código* = líneas que no están en blanco ni son solo comentario.

| Archivo                             | Total | En blanco | Comentario | **Código** |
| ----------------------------------- | ----: | --------: | ---------: | ---------: |
| `public/MiniCRM.html`               | 1202  | 129       | 63         | **1010**   |
| `src/servicios/clientes.ts`         | 342   | 49        | 45         | **248**    |
| `src/servicios/normalizar.ts`       | 191   | 27        | 13         | **151**    |
| `src/mcp/servidor.ts`               | 187   | 24        | 12         | **151**    |
| `src/db/seed-data.ts`               | 85    | 2         | 2          | **81**     |
| `src/db/schema.ts`                  | 43    | 5         | 4          | **34**     |
| `src/db/seed.ts`                    | 42    | 6         | 2          | **34**     |
| `src/api/errores.ts`                | 42    | 8         | 2          | **32**     |
| `src/config.ts`                     | 36    | 6         | 0          | **30**     |
| `src/servicios/errores.ts`          | 42    | 7         | 6          | **29**     |
| `src/api/actividades.controller.ts` | 41    | 8         | 6          | **27**     |
| `src/mcp/mcp.routes.ts`             | 34    | 4         | 3          | **27**     |
| `src/api/clientes.controller.ts`    | 37    | 8         | 7          | **22**     |
| `src/app.ts`                        | 24    | 6         | 1          | **17**     |
| `src/servicios/fechas.ts`           | 22    | 3         | 4          | **15**     |
| `src/index.ts`                      | 19    | 3         | 1          | **15**     |
| `src/api/clientes.routes.ts`        | 13    | 2         | 0          | **11**     |
| `src/api/actividades.routes.ts`     | 13    | 2         | 1          | **10**     |
| `src/db/client.ts`                  | 14    | 3         | 1          | **10**     |
| `src/api/index.ts`                  | 9     | 2         | 1          | **6**      |
| `src/db/migrate.ts`                 | 6     | 1         | 0          | **5**      |
| **Total**                           | **2444** | **305** | **174**   | **1965**   |

Por capa (líneas de código):

| Capa                                         | Código |
| -------------------------------------------- | -----: |
| Frontend (`MiniCRM.html`): JSX 714 · CSS 273 · HTML 23 | 1010 |
| Servicio (`src/servicios`)                   | 443    |
| MCP (`src/mcp`)                              | 178    |
| Base de datos (`src/db`, incluye 81 de datos de ejemplo) | 164 |
| API REST (`src/api`)                         | 108    |
| Arranque y configuración en código (`app.ts`, `index.ts`, `config.ts`) | 62 |
| **Total**                                    | **1965** |

### Tiempo de desarrollo

- **Tiempo neto medido:** alrededor de **1 h 05 min**, el 23/10/2026 de 21:23 a 22:27 (hora de Argentina). Va desde la creación de `tsconfig.json` (primer archivo del proyecto) hasta el cierre de este informe, según las marcas de tiempo de los archivos. Incluye las pruebas de cada etapa (servicio, curl contra REST y MCP, y navegador) y el tiempo entre prompts.
- **Tiempo estimado para un desarrollador sin asistencia:** entre **14 y 18 horas**.

| Etapa                                              | Estimado |
| -------------------------------------------------- | -------: |
| Configuración, esquema, migración y seed           | 1,5 h    |
| Servicio, normalización y reglas de negocio        | 3 h      |
| API REST y manejo de errores                       | 2 h      |
| Interfaz maestro-detalle                           | 3 h      |
| Formularios y gestión de actividades               | 3 h      |
| Servidor MCP y selector REST/MCP                   | 2 h      |
| Pruebas y documentación                            | 1,5–3,5 h |

### Limitaciones conocidas

- **Descripción única por cliente:** la unicidad distingue mayúsculas, así que "Llamar" y "LLAMAR" pueden convivir. Para que no las distinga habría que crear el índice con `COLLATE NOCASE`, lo que requiere una nueva migración.
- **Búsqueda en memoria:** se resuelve en el servidor de la aplicación para ignorar acentos, cosa que SQLite no hace sin extensiones. Es adecuada para el volumen de un MiniCRM.
- **Babel en el navegador:** compila el JSX al cargar la página, lo cual es apropiado para el TP pero no para producción, donde convendría precompilar.
- **Servidor MCP sin autenticación ni sesiones:** está pensado para uso local.
