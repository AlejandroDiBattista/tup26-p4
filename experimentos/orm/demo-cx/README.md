# Node.js + TypeScript + Drizzle

API REST con Express, SQLite local en desarrollo y Turso en producción. Usa `@libsql/client` para ambos entornos y migraciones SQL de Drizzle. Modela clientes con una lista de actividades (composición 1:n).

## Instalación

Requiere Node.js 22 o superior y npm. Ejecutar los comandos desde la raíz del proyecto:

```bash
npm ci
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

En desarrollo se crea `local.db` en la raíz. `dev` inicia la API en `http://localhost:3000` y reinicia al modificar el código. El puerto se configura con `PORT`. La base local y las credenciales están excluidas de Git.

## Interfaz MicroCRM

Abrir [MicroCRM](http://localhost:3000/microcrm.html) con el servidor iniciado. `/` redirige a esta página. Presenta un maestro y detalle: búsqueda en vivo por cualquier campo del cliente (incluido el ID, con o sin `#`), selección, ficha y actividades con sus estados. La búsqueda combina palabras de distintos campos e ignora mayúsculas y acentos. El ID aparece como `#123` arriba a la derecha de la ficha. La página ocupa la altura de la ventana; el maestro y las actividades tienen scroll independiente, manteniendo visibles la búsqueda, la ficha. En pantallas angostas, ambos paneles se apilan conservando el scroll interno.

**Agregar** y **Editar** abren el mismo formulario en el detalle, con los valores existentes precargados al editar. Las filas son: nombre/apellido, email/teléfono y domicilio/localidad, con **Guardar** y **Cancelar** debajo. Guardar usa la respuesta normalizada de la API para actualizar el maestro y la ficha, selecciona el cliente guardado y limpia la búsqueda para que quede visible. Cancelar descarta los cambios del formulario. Los errores se muestran en línea sin perder lo ingresado; durante el guardado se bloquean las acciones para evitar envíos duplicados. Las actividades completadas permanecen inalterables. Los compromisos pendientes se gestionan con el subformulario descrito debajo.

Debajo de la ficha hay un subformulario de una línea, con borde de puntos redondeado, descripción, fecha opcional e iconos Guardar/Cancelar. Guardar crea o actualiza mediante la API, limpia los campos y vuelve a consultar la ficha; Cancelar limpia y recarga sin guardar. Cada pendiente incluye un check para completarlo y botones accesibles para editar o borrar. Editar precarga el subformulario; completar establece la fecha de finalización desde el servidor y mueve la actividad a Completadas. Las completadas no presentan controles de modificación. Los campos e iconos tienen nombres accesibles y los errores se muestran en línea.

`public/microcrm.html` contiene todo el CSS y JSX, sin bundler. Carga React **18.3.1**, React DOM **18.3.1** y Babel Standalone **7.26.9** desde jsDelivr, por lo que requiere conexión a Internet para descargar esas bibliotecas. Babel registra explícitamente un preset con `runtime: 'classic'` para usar `React` global. El navegador compila el JSX al abrir la página.

El archivo se organiza en los adaptadores `ClientesREST`/`ActividadesREST` y el módulo `MicroCrmMcp`, componentes comunes (`Layout`, `Icono`, `Boton`, `Entrada`, `CampoEntrada`, `FormularioCliente`, `SubformularioActividad`, `ListaEntidades`, `DatosEntidad`) y las vistas `MaestroClientes`, `DetalleCliente` y `ActividadesCliente`. Con REST seleccionado, la página consulta y guarda mediante la API del mismo origen de Express: GET para listar, POST para agregar o completar, PATCH para editar y DELETE para borrar pendientes. La búsqueda visual filtra en memoria los campos de los clientes cargados y las actividades se separan en Compromisos y Actividades completadas. Los compromisos se ordenan primero sin fecha, luego vencidos y por último con fecha actual o futura, con fechas ascendentes dentro de cada grupo. Cada fila presenta una casilla de estado, la descripción y únicamente la fecha de compromiso pendiente (o «Sin fecha de compromiso») o de finalización. Los grupos vacíos muestran una sola línea compacta. El botón Actualizar vuelve a consultar el servidor; los estados provienen del servicio. El CRUD de la API REST sigue disponible para otros consumidores.

## API REST

Los cuerpos y respuestas usan JSON y los nombres de campos del servicio (camelCase). Los routers declaran las rutas, los controladores adaptan las peticiones HTTP y el servicio conserva las reglas de negocio.

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | `/api/clientes` | Buscar clientes con sus actividades |
| POST | `/api/clientes` | Crear cliente |
| GET | `/api/clientes/:clienteId` | Obtener cliente con actividades |
| PATCH | `/api/clientes/:clienteId` | Actualizar parcialmente cliente |
| DELETE | `/api/clientes/:clienteId` | Eliminar cliente y sus actividades |
| GET | `/api/clientes/:clienteId/actividades` | Buscar actividades del cliente |
| POST | `/api/clientes/:clienteId/actividades` | Crear actividad |
| GET | `/api/clientes/:clienteId/actividades/:actividadId` | Obtener actividad |
| PATCH | `/api/clientes/:clienteId/actividades/:actividadId` | Actualizar actividad pendiente |
| DELETE | `/api/clientes/:clienteId/actividades/:actividadId` | Eliminar actividad pendiente |
| POST | `/api/clientes/:clienteId/actividades/:actividadId/completar` | Completar actividad |

Las altas devuelven `201` con el registro y cabecera `Location`, las consultas y modificaciones `200`, y las bajas `204` sin cuerpo. Los errores tienen formato `{ "error": "mensaje" }`: `400` para datos, filtros o IDs inválidos; `404` para registros o rutas inexistentes; `409` para email duplicado o modificación/borrado de una completada; `413` para cuerpos mayores de 100 KB y `500` para errores internos sin revelar detalles de la base.

La búsqueda recibe `?q=texto` o filtros por cualquier campo, por ejemplo `?apellido=perez&localidad=yerba`. No se combinan `q` y filtros por campo. `?telefono=null` busca valores nulos; IDs se interpretan como enteros. Las actividades también admiten `?estado=vencida`, `pendiente` o `completada`. Las escrituras rechazan campos desconocidos, tipos incorrectos e IDs en el cuerpo; el cliente de una actividad se toma de la ruta.

```bash
curl 'http://localhost:3000/api/clientes?q=perez'

curl -X POST http://localhost:3000/api/clientes \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","apellido":"Pérez","email":"ana.nueva@example.com"}'

curl -X POST http://localhost:3000/api/clientes/1/actividades \
  -H 'Content-Type: application/json' \
  -d '{"descripcion":"Enviar propuesta","fechaCompromiso":"2026-10-25"}'

curl 'http://localhost:3000/api/clientes/1/actividades?estado=pendiente'

# Sustituir 41 por el ID devuelto al crear la actividad.
curl -X POST http://localhost:3000/api/clientes/1/actividades/41/completar \
  -H 'Content-Type: application/json' -d '{}'
```

Completar acepta `{}` o un cuerpo omitido para usar hoy, o `{ "fechaFinalizacion": "2026-10-16" }` para indicar la fecha. Una vez completada, la actividad rechaza modificaciones y borrado individual. La API es una base de desarrollo sin autenticación.

## Elegir REST o MCP desde la página

En la cabecera del maestro, **Conexión** permite elegir **REST** o **MCP**. REST es la opción inicial en cada apertura de la página. Para conectarse a MCP:

1. Iniciar Express con `npm run dev` y abrir `/microcrm.html` desde ese servidor.
2. Marcar **MCP**. La página inicializa el cliente contra `/mcp` del mismo origen y vuelve a cargar los clientes.
3. Usar los mismos formularios y acciones de clientes y compromisos. Marcar REST vuelve a consultar la misma base mediante `/api/clientes`.

No se necesitan credenciales para esta demo local ni una configuración adicional. El selector se bloquea durante un guardado o mientras está abierto el formulario de cliente. Cambiar de conexión conserva la selección siempre que el cliente siga disponible. Ante un error se muestra un mensaje y se puede reintentar con Actualizar o volver a REST; no hay cambio automático de transporte ni reintento automático de escrituras.

El bloque `<script type="module" id="microcrm-mcp-client">` contiene el cliente MCP independiente y embebido. No requiere otra biblioteca: usa `fetch` para `initialize`, `notifications/initialized` y `tools/call`, negocia la versión y envía `MCP-Protocol-Version`. Está diseñado para el servidor de este proyecto: Streamable HTTP sin sesiones y con respuestas JSON. No es un cliente MCP genérico con soporte para canales SSE persistentes, OAuth o servidores externos.

El módulo exporta `window.MicroCrmMcp` con servicios de clientes y actividades equivalentes a REST. Un contexto React selecciona el adaptador que usan los componentes; los formularios y las reglas del servidor son compartidos. Los errores `isError` de las herramientas se convierten en errores de formulario. `test/web-mcp.test.ts` verifica el bloque embebido real contra Express, incluyendo inicialización, CRUD, errores, cancelación de lecturas y visibilidad de cambios desde REST.

## Servidor MCP

El mismo proceso Express publica **`/mcp`** con el SDK oficial `@modelcontextprotocol/sdk` y transporte **Streamable HTTP**. REST y MCP reciben la misma conexión Drizzle y llaman a la misma clase `Clientes`: cualquier cambio hecho por una herramienta queda disponible en REST y en la página al actualizar.

### Conectarse

1. Iniciar el proyecto con `npm run dev`.
2. En un cliente MCP que admita Streamable HTTP, agregar un servidor con URL `http://localhost:3000/mcp` (reemplazar el puerto si `PORT` es otro).
3. Seleccionar **Streamable HTTP**, sin credenciales para esta demo local. No usar transporte stdio ni el transporte SSE antiguo.

También se puede usar el cliente oficial desde la raíz del proyecto:

```bash
node --input-type=module <<'JS'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client({ name: 'cliente-microcrm', version: '1.0.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL('http://localhost:3000/mcp')));
  console.log(await client.listTools());
  console.log(await client.callTool({ name: 'clientes_buscar', arguments: { filtro: 'perez' } }));
} finally {
  await client.close();
}
JS
```

Para inspeccionar los esquemas y ejecutar herramientas de forma visual: `npx @modelcontextprotocol/inspector`, elegir Streamable HTTP e ingresar la misma URL. Los clientes se encargan del handshake `initialize` y de los encabezados del protocolo.

### Herramientas

| Herramienta | Entrada |
| --- | --- |
| `clientes_buscar` | `filtro` opcional: texto libre u objeto por campos |
| `clientes_obtener` | `clienteId` |
| `clientes_crear` | `datos`: nombre, apellido, email y opcionales de contacto |
| `clientes_actualizar` | `clienteId`, `datos` con al menos un campo |
| `clientes_eliminar` | `clienteId`; elimina también todas sus actividades |
| `actividades_buscar` | `clienteId`, `filtro` opcional por cualquier campo o estado |
| `actividades_obtener` | `clienteId`, `actividadId` |
| `actividades_crear` | `clienteId`, `datos`: descripción y fechas opcionales |
| `actividades_actualizar` | `clienteId`, `actividadId`, `datos` con al menos un campo |
| `actividades_completar` | `clienteId`, `actividadId`, `fecha` opcional; hoy en Tucumán por defecto |
| `actividades_eliminar` | `clienteId`, `actividadId`; solo pendientes |

Los esquemas Zod publicados por `tools/list` describen los campos y rechazan IDs no positivos, tipos incorrectos, campos desconocidos y cambios vacíos. Los datos usan los nombres camelCase de REST: `descripcion`, `fechaCompromiso` y `fechaFinalizacion`. Las fechas son `AAAA-MM-DD`; el servicio valida que existan en el calendario. `null` en fecha de compromiso significa sin fecha; `null` en finalización significa pendiente.

Ejemplos de argumentos:

```json
{ "clienteId": 1, "datos": { "descripcion": "Enviar propuesta", "fechaCompromiso": null } }
```

```json
{ "clienteId": 1, "filtro": { "estado": "vencida" } }
```

```json
{ "clienteId": 1, "actividadId": 3, "fecha": "2026-10-16" }
```

Las actividades siempre pertenecen al cliente indicado: un ID de otro cliente no permite leerlas ni modificarlas. El servicio normaliza los datos, exige email único y bloquea edición, reapertura y borrado individual de completadas. El borrado del cliente conserva el comportamiento en cascada de REST, incluidas sus actividades completadas. Las herramientas destructivas se anuncian con `destructiveHint` y las consultas con `readOnlyHint`.

### Respuestas y transporte

Los éxitos incluyen `{ "datos": ... }` en `structuredContent` y también como texto JSON. Los errores del servicio devuelven `isError: true` y `{ "codigo": "validacion|no_encontrado|conflicto|interno", "mensaje": "..." }`. Los errores de esquema los comunica el SDK como errores de herramienta con el campo inválido; no son un resultado exitoso. Los errores internos no exponen SQL ni detalles de la base.

El transporte es **sin sesiones**, con una instancia de servidor y transporte por POST y respuestas JSON (`enableJsonResponse`). GET y DELETE sobre `/mcp` devuelven `405`; no hay un canal SSE persistente ni un ID de sesión que conservar. Esto sigue siendo Streamable HTTP. La conexión de base de datos pertenece a Express y no se cierra al terminar una petición MCP.

Por defecto solo se aceptan hosts y orígenes de loopback para el puerto actual. Para un dominio propio, definir listas exactas separadas por comas en `MCP_ALLOWED_HOSTS` (por ejemplo `crm.example.com`) y `MCP_ALLOWED_ORIGINS` (por ejemplo `https://crm.example.com`). Esta demo no incluye autenticación; una publicación remota necesita control de acceso delante del endpoint.

La prueba `test/mcp.test.ts` usa el cliente oficial por HTTP con SQLite en memoria: descubre herramientas, valida argumentos, comprueba escrituras compartidas con REST, clientes concurrentes, aislamiento por cliente, errores de email, finalización, bloqueo de completadas y borrado en cascada.

Referencia: [SDK oficial: servidor y Streamable HTTP](https://ts.sdk.modelcontextprotocol.io/server).

## Clientes y actividades

Los clientes tienen `id`, `nombre`, `apellido`, `email` único y, opcionalmente, `domicilio`, `localidad` y `telefono`. Cada actividad pertenece a un cliente y tiene `id`, `descripcion`, `fechaCompromiso` y `fechaFinalizacion`. Las fechas se guardan como texto ISO `YYYY-MM-DD` o `NULL`.

- `fechaCompromiso = NULL`: actividad sin fecha comprometida.
- `fechaFinalizacion = NULL`: actividad pendiente; se llena al completarla.
- Eliminar un cliente elimina sus actividades mediante una clave foránea con `ON DELETE CASCADE`.

`npm run db:seed` carga 10 clientes ficticios y 40 actividades: 20 completadas y 20 pendientes; en cada estado hay actividades con y sin fecha de compromiso. La carga es transaccional y repetible: identifica clientes por email y actividades por cliente y descripción. Inserta lo faltante sin sobrescribir datos existentes, incluidas las fechas de finalización. No cambia descripciones del ejemplo para evitar identificarlas como actividades nuevas. La unicidad de descripción se usa solo en la carga, no como restricción del dominio.

## Estructura

```text
src/
  config.ts          Configuración según NODE_ENV
  index.ts           Servidor HTTP y cierre de conexión
  app.ts             Aplicación Express con conexión inyectada
  mcp/               Esquemas, herramientas y router Streamable HTTP
  controllers/       Adaptación de peticiones y respuestas
  routes/            Rutas de clientes y actividades
  http/              Validación del formato HTTP y manejo de errores
  errores.ts         Errores del servicio independientes de HTTP
  clientes.ts        Servicio Clientes: CRUD de clientes y actividades
  normalizar.ts      Normalización y validación de datos
  busqueda.ts        Búsqueda flexible por texto o campos
  db/
    connection.ts    Conexión y cierre
    schema.ts        Tablas y tipos
    migrate.ts       Aplicación de migraciones
    seed-data.ts     Datos ficticios
    seed.ts          Carga transaccional repetible
    seed-cli.ts      Entrada para ejecutar la carga
drizzle/             SQL e historial de migraciones
public/microcrm.html Interfaz React con JSX y CSS embebidos
test/                Pruebas con SQLite en memoria
```

## Servicio Clientes

`src/clientes.ts` exporta la clase `Clientes`, con métodos estáticos. Todos reciben la conexión `db` como primer argumento; los tipos de datos se infieren del esquema Drizzle mediante `$inferInsert` y `$inferSelect`.

```ts
import { Clientes } from './clientes.js';

const cliente = await Clientes.crear(db, {
  nombre: '  ANA ', apellido: ' PÉREZ ', email: ' ANA@EXAMPLE.COM ',
  telefono: '+54 (381) 555-0101',
});
await Clientes.actualizar(db, cliente.id, { localidad: 'Yerba Buena' });
await Clientes.obtener(db, cliente.id); // Incluye su lista de actividades y estados.

await Clientes.buscar(db, 'perez'); // Texto parcial en cualquier campo del cliente.
await Clientes.buscar(db, { apellido: 'PÉREZ', localidad: 'yerba' }); // Combina con AND.
await Clientes.buscar(db, { telefono: null }); // Busca valores nulos explícitos.

const actividad = await Clientes.crearActividad(db, cliente.id, {
  descripcion: 'Enviar propuesta', fechaCompromiso: '2026-10-25',
});
await Clientes.obtenerActividad(db, cliente.id, actividad.id);
await Clientes.actualizarActividad(db, cliente.id, actividad.id, { fechaCompromiso: null });
await Clientes.buscarActividades(db, cliente.id, { estado: 'pendiente' });
await Clientes.completarActividad(db, cliente.id, actividad.id); // Fecha de hoy.
// Ahora actualizarActividad y eliminarActividad rechazan esta actividad.
await Clientes.eliminar(db, cliente.id); // Borra también sus actividades.
```

CRUD de clientes: `crear`, `obtener`, `buscar`, `actualizar`, `eliminar`. CRUD de actividades: `crearActividad`, `obtenerActividad`, `buscarActividades`, `actualizarActividad`, `eliminarActividad`, más `completarActividad`. Las actividades siempre se operan dentro de un cliente; un ID de otro cliente no permite leerlas ni modificarlas. Las consultas devuelven listas ordenadas por ID. Un registro inexistente o una operación bloqueada produce un error.

La búsqueda admite cualquier campo persistido y, en actividades, también `estado`. Las cadenas coinciden parcialmente, sin distinguir mayúsculas ni acentos; los números y `null` coinciden exactamente. Los filtros por campos se combinan con AND; el texto libre busca en cualquiera de los campos escalares. La búsqueda de clientes no incluye los campos de sus actividades. Esta base pequeña filtra en memoria para permitir comparación Unicode uniforme entre SQLite y Turso; para grandes volúmenes conviene trasladar los filtros y la paginación a SQL.

Al guardar desde el servicio o la semilla, los nombres y apellidos quedan sin espacios sobrantes y con iniciales en mayúscula; los emails se recortan y pasan a minúsculas; los teléfonos conservan solo dígitos y un `+` inicial si estaba presente, sin inferir un código de país. Los opcionales vacíos se guardan como `null`. Se rechazan nombres, apellidos y descripciones vacíos, emails o teléfonos inválidos y fechas inexistentes o fuera del formato `YYYY-MM-DD`.

`fechaFinalizacion` representa la fecha de ejecución: cualquier valor no nulo determina el estado `completada`. Se carga con `completarActividad` (hoy por defecto, o una fecha explícita) o al guardar `fechaFinalizacion`. Una actividad completada no admite cambios, reapertura ni borrado individual. El bloqueo se verifica en el `WHERE` de la escritura, evitando que dos operaciones simultáneas sobrescriban una completada. La eliminación del cliente conserva el borrado en cascada del componente completo.

Una actividad sin finalización es `vencida` únicamente cuando su compromiso es anterior a hoy; si vence hoy, a futuro o no tiene fecha, es `pendiente`. Hoy se calcula en `America/Argentina/Tucuman`, independientemente de la zona del servidor. Los estados son calculados, no almacenados. Las consultas admiten un último argumento `hoy` en formato ISO para verificar fechas de forma reproducible.

## Cambiar el esquema

Editar `src/db/schema.ts`, generar una migración, revisar el SQL y aplicarla:

```bash
npm run db:generate
npm run db:migrate
```

Versionar la carpeta `drizzle/` completa. Las migraciones se ejecutan explícitamente y se registran para evitar reaplicarlas; iniciar la aplicación no modifica el esquema.

## Pruebas y compilación

```bash
npm run check
npm test
npm run build
npm start
```

Las pruebas aplican las migraciones reales en SQLite en memoria y verifican la carga repetida, las cantidades y fechas, la conservación de cambios, emails únicos, claves foráneas, borrado en cascada y configuración por entorno. Las pruebas REST abren puertos temporales en localhost y verifican CRUD, filtros, finalización, aislamiento por cliente y códigos de error mediante peticiones HTTP reales. No modifican `local.db` ni contactan Turso.

En la verificación inicial, `npm audit` reportó cuatro alertas moderadas en la cadena de desarrollo `drizzle-kit → @esbuild-kit → esbuild`, relacionadas con el servidor de desarrollo de esbuild. Ese servidor no se usa en este proyecto. La corrección automática propuesta retrocede Drizzle Kit a una versión antigua e incompatible con esta configuración, por lo que no se aplicó. Podés revisar el estado actualizado con `npm audit`; esas herramientas se excluyen al usar `npm prune --omit=dev`.

## Producción con Turso

Crear una base en Turso y obtener su URL y token desde el panel. Definir estas variables en el entorno del proceso o en `.env`:

```dotenv
NODE_ENV=production
TURSO_DATABASE_URL=libsql://nombre-de-la-base.turso.io
TURSO_AUTH_TOKEN=tu-token
```

Compilar y aplicar las migraciones antes de iniciar:

```bash
npm ci
npm run build
npm run db:migrate:production
npm start
```

El paso de compilación requiere las dependencias de desarrollo. Para una instalación reducida, ejecutar `npm prune --omit=dev` después de compilar. Conservar `dist/`, `drizzle/`, `public/`, `package.json` y `package-lock.json` en el despliegue; los comandos parten de esa raíz.

Con `NODE_ENV=production`, la aplicación exige URL remota y token; si faltan, falla antes de abrir una conexión. Las migraciones de producción se aplican a esa base remota. No se trasladan automáticamente los datos de `local.db`. La conexión real a Turso requiere tus credenciales.

Referencia: [Drizzle con SQLite y libSQL](https://orm.drizzle.team/docs/get-started/sqlite-new).
