# demo-oc

Proyecto base en **Node.js + TypeScript + Drizzle ORM + SQLite local**, con un servicio de
**clientes y sus actividades (relación 1:n)**, datos de ejemplo y tests.

## Modelo

```
clientes 1 ──── n actividades
```

| `clientes`  | Tipo   | Obligatorio |
| ----------- | ------ | ----------- |
| `id`        | entero | sí (PK)     |
| `nombre`    | texto  | sí          |
| `apellido`  | texto  | sí          |
| `email`     | texto  | sí (único)  |
| `domicilio` | texto  | no          |
| `localidad` | texto  | no          |
| `telefono`  | texto  | no          |

| `actividades`        | Tipo      | Regla                                                         |
| -------------------- | --------- | ------------------------------------------------------------- |
| `id`                 | entero    | PK                                                            |
| `cliente_id`         | entero    | FK → `clientes.id`, `ON DELETE CASCADE`                       |
| `descripcion`        | texto     | obligatoria                                                   |
| `fecha_compromiso`   | timestamp | **nullable**: `null` = sin fecha acordada                      |
| `fecha_finalizacion` | timestamp | **nullable**: la asigna `completarActividad`, nunca el alta    |

Reglas de estado:

- **Completada** si tiene `fecha_finalizacion`. No se puede editar ni borrar individualmente,
  y `completarActividad` no reescribe su fecha (es idempotente).
- **Vencida** si sigue pendiente y su `fecha_compromiso` es anterior al comienzo de hoy.
  Una actividad pendiente *sin* fecha de compromiso no está vencida.
- **Composición**: la actividad no existe sin su cliente. `eliminar(idCliente)` borra al
  cliente y todas sus actividades en una transacción — incluidas las completadas, que sí
  caen cuando se borra el cliente. En sentido inverso, **ninguna operación de actividad
  acepta un id suelto**: todas reciben el `clienteId` y validan la pertenencia, así que no
  se puede leer ni modificar la actividad de otro cliente.

## Stack

| Pieza      | Elección                      | Por qué                            |
| ---------- | ----------------------------- | ---------------------------------- |
| Runtime    | Node.js 22+                   | ESM nativo                          |
| Lenguaje   | TypeScript (`strict`)         | Tipos de extremo a extremo          |
| ORM        | Drizzle ORM                   | SQL tipado, sin runtime pesado      |
| Driver     | `better-sqlite3`              | Síncrono, rápido, sin servidor      |
| Base datos | SQLite (archivo o `:memory:`) | Cero configuración                  |
| HTTP       | Express 5                     | Capa fina sobre el servicio         |
| Interfaz   | React 18 + Babel standalone   | Desde CDN, sin build ni frameworks  |
| Tests      | Vitest                        | Rápido, con base en memoria por test |

## Estructura

```
.
├── drizzle.config.ts          # Config de drizzle-kit (generate / studio)
├── drizzle/                   # Migración SQL generada (versionada)
├── src/
│   ├── db/
│   │   ├── schema.ts          # Tablas + tipos inferidos (Cliente, Actividad, ...)
│   │   ├── client.ts          # Conexión + runMigrations()
│   │   ├── migrate.ts         # Script: aplica migraciones
│   │   └── seed.ts            # Semilla de 10 clientes con actividades (idempotente)
│   ├── servicios/
│   │   ├── cliente-repository.ts  # Repositorio: clase ClienteRepository (clientes + actividades)
│   │   ├── errores.ts         # Errores de dominio (NoEncontrado, Conflicto, ReglaDeNegocio)
│   │   └── normalizar.ts      # Normalización de nombres, emails y teléfonos
│   ├── api/
│   │   ├── app.ts             # App Express: middlewares, routers, 404 y errores
│   │   ├── errores.ts         # ErrorDeSolicitud + traducción a códigos HTTP
│   │   ├── peticion.ts        # Lectura y validación de params, query y body
│   │   ├── controladores/     # Petición HTTP <-> servicio (sin reglas de negocio)
│   │   └── routers/           # Rutas /api/clientes y /:clienteId/actividades
│   ├── index.ts               # Ejemplo ejecutable (CLI)
│   └── server.ts              # Arranque de la API REST
├── public/
│   └── MiniCRM.html           # Interfaz: React + JSX + CSS en un solo archivo
└── tests/
    ├── clientes.test.ts       # CRUD de clientes, búsqueda por texto, composición
    ├── actividades.test.ts    # CRUD de actividades, completar, vencidas, reglas
    ├── normalizar.test.ts     # Normalización
    ├── seed.test.ts           # Volumen, datos variados e idempotencia
    ├── api.test.ts            # Endpoints, códigos HTTP y rutas anidadas
    └── test-db.ts             # Helper: base en memoria migrada
```

Hay **un solo módulo de acceso a datos**: `src/servicios/cliente-repository.ts` con la clase
`ClienteRepository` (métodos estáticos). Los repositorios separados de clientes y actividades
se unificaron dentro de ella, así que todo pasa por el mismo lugar y ninguna regla se puede
saltar por otro camino.

## Requisitos

- Node.js **22 o superior**
- npm 10 o superior

## Instalación

```bash
npm install
cp .env.example .env     # opcional: ajusta DATABASE_URL
```

## Carga de datos

```bash
npm run db:migrate       # crea las tablas (data/app.db)
npm run db:seed          # carga los 10 clientes con sus actividades
```

Salida la primera vez:

```
Clientes: 10 nuevos, 10 en total.
Actividades: 29 nuevas, 29 en total.
```

**La semilla es idempotente**: puedes ejecutarla cuantas veces quieras, sin duplicar filas
ni mover fechas. Usa dos claves naturales con `ON CONFLICT DO NOTHING`:

- Cliente → `email` (índice único).
- Actividad → `(cliente_id, descripcion)` (índice único).

Si agregas entradas a `SEMILLA` en `src/db/seed.ts`, la próxima corrida inserta solo lo que
falta y deja lo existente intacto (`+1 clientes, +2 actividades`).

Nota: una actividad se identifica por su descripción dentro del cliente, así que dos
actividades del mismo cliente no pueden llamarse igual. Si tu dominio necesita repetirlas,
quita el índice `actividades_cliente_descripcion_unique` y define otro criterio de deduplicación.

## Ejecución

```bash
npm start                # CLI: migra, siembra, busca y muestra un cliente con sus actividades
npm run dev              # igual, con recarga automática
npm run api              # API REST en http://localhost:3000 (ver abajo)
npm run api:dev          # API REST con recarga automática
```

Para apuntar a otra base:

```bash
DATABASE_URL=./data/otra.db npm start
```

## API REST

```bash
npm run api                          # migra, siembra y escucha en http://localhost:3000
PORT=4000 SEED=false npm run api     # otro puerto, sin cargar la semilla
```

La app se arma en `src/api/app.ts` (sin `listen`), así los tests la ejercitan sin abrir un
puerto; `src/server.ts` conecta, migra, configura el repositorio, siembra y escucha. Configurar
es un paso propio del arranque: con `SEED=false` la API funciona igual.

### Endpoints

| Método    | Ruta                                                         | Respuesta                                |
| --------- | ------------------------------------------------------------ | ---------------------------------------- |
| GET       | `/api/clientes`                                              | 200 · lista; `?buscar=texto` filtra      |
| POST      | `/api/clientes`                                              | 201 + `Location` · crea                  |
| GET       | `/api/clientes/:clienteId`                                   | 200 · uno                                |
| PUT/PATCH | `/api/clientes/:clienteId`                                   | 200 · actualización parcial              |
| DELETE    | `/api/clientes/:clienteId`                                   | 204 · baja junto con sus actividades     |
| GET       | `/api/clientes/:clienteId/actividades`                       | 200 · lista con filtros                  |
| POST      | `/api/clientes/:clienteId/actividades`                       | 201 + `Location` · crea pendiente        |
| GET       | `/api/clientes/:clienteId/actividades/:actividadId`          | 200 · una                                |
| PUT/PATCH | `/api/clientes/:clienteId/actividades/:actividadId`          | 200 · edita (409 si está completada)     |
| DELETE    | `/api/clientes/:clienteId/actividades/:actividadId`          | 204 (409 si está completada)             |
| POST      | `/api/clientes/:clienteId/actividades/:actividadId/completar` | 200 · completa                           |

Filtros de `GET .../actividades`: `estado` (`pendiente`, `completada`, `vencida`),
`descripcion`, `sinFecha=true`, `compromisoDesde` y `compromisoHasta` (fechas ISO).

`completar` acepta `{ "fecha": "2026-02-10T12:00:00.000Z" }` (opcional; sin body usa el
momento actual) y es idempotente: si la actividad ya estaba completada, devuelve la misma
fecha de finalización sin reescribirla.

### Ejemplos

```bash
curl localhost:3000/api/clientes
curl "localhost:3000/api/clientes?buscar=rosario"

curl -X POST localhost:3000/api/clientes \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana","apellido":"Gómez","email":"ana@example.com"}'

curl localhost:3000/api/clientes/1/actividades
curl "localhost:3000/api/clientes/1/actividades?estado=vencida"

curl -X POST localhost:3000/api/clientes/1/actividades \
  -H 'Content-Type: application/json' \
  -d '{"descripcion":"Enviar propuesta","fechaCompromiso":"2026-11-01"}'

curl -X POST localhost:3000/api/clientes/1/actividades/4/completar
```

### Errores

Todas las respuestas de error tienen la forma `{ "error": "..." }`:

| Situación                                              | Estado |
| ------------------------------------------------------ | ------ |
| body o parámetros inválidos                             | 400    |
| cliente/actividad inexistente o de otro cliente         | 404    |
| email duplicado, editar/borrar una actividad completada | 409    |

Las reglas siguen en el servicio: lanza `NoEncontrado`, `Conflicto` y `ReglaDeNegocio`
(`src/servicios/errores.ts`) sin saber nada de HTTP. `manejarErrores` (`src/api/errores.ts`)
es el único lugar que elige el código de estado; los controladores solo leen la petición y
escriben la respuesta, y los routers solo declaran rutas.

## Interfaz web (MiniCRM)

Con la API levantada, la interfaz está en **http://localhost:3000** (la raíz redirige a la página).

`public/MiniCRM.html` es **una sola página autocontenida**: HTML, CSS y JSX embebido, sin build
ni dependencias instaladas. React 18.3.1 y Babel standalone 7.26.4 se cargan desde CDN con
versión fija, y Babel se configura explícitamente con `runtime: "classic"`:

```html
<script>
  Babel.registerPreset("react-clasico", {
    presets: [[Babel.availablePresets.react, { runtime: "classic", development: false }]],
  });
</script>
<script type="text/babel" data-presets="react-clasico">…</script>
```

El runtime clásico emite `React.createElement(...)` y usa el `React` global del build UMD
(React 18 es la última versión que publica UMD; React 19 la eliminó). No hay librerías de
componentes ni framework de CSS: sólo React, CSS puro con custom properties y SVG en línea.
El tema claro/oscuro sale de `prefers-color-scheme`.

Transpilar en el navegador es ideal para una demo autocontenida (Babel avisa por consola que no
se use así en producción): para producción se precompila el JSX y se sirven los archivos ya
transformados, sin Babel.

**Toda la funcionalidad pasa por la API REST**: la página no guarda estado de los datos, no
tiene datos de prueba y no toca la base. Cada acción es un `fetch` y cada lista se vuelve a pedir
después de escribir, así lo que se ve es siempre lo que respondió la API.

El archivo está dividido en cinco secciones, con los componentes reutilizables separados por
responsabilidad:

| Sección            | Contenido                                                                 |
| ------------------ | ------------------------------------------------------------------------- |
| Utilidades         | Fechas de calendario en UTC (igual que el modelo), iniciales, estado de una actividad |
| Servicios          | `pedir()`, `ErrorDeApi`, `Clientes.*` y `Actividades.*` (listar, crear, actualizar, eliminar, completar): la única puerta a la API |
| Primitivas de UI   | `Boton`, `ConfirmarBoton`, `Campo`, `Formulario`, `Aviso`, `Segmentado`, `Vacio`, `Cargando`, `Icono` (SVG) |
| Entidades          | `TarjetaCliente` y `ListaClientes` (listar), `FichaCliente` y `Dato` (mostrar), `ItemActividad`, `GrupoActividades` y `ListaActividades` (listar), `FormularioCliente` y `FormularioActividad` (editar) |
| Composición        | `Marco` (layout maestro/detalle) y `App` (estado, recursos y acciones) |

### Maestro y detalle

La página es una **app de altura completa**: ocupa `100dvh`, nunca scrollea y reparte el
espacio como maestro y detalle. El maestro queda a la izquierda (`330px`) con la búsqueda fija
arriba y la lista de clientes con scroll propio; el detalle ocupa el resto, con la ficha del
cliente y el subformulario de compromisos fijos y **sólo la lista de actividades scrolleando**.
Así la búsqueda, la ficha y el subformulario se ven siempre, sin importar dónde esté el scroll.
El identificador del cliente se muestra como `#123` arriba a la derecha del detalle. Si la
ventana es baja, los datos del cliente (email, teléfono, domicilio, localidad) son los que ceden
y scrollean solos: la cabecera con el identificador, el subformulario y la lista de actividades
nunca bajan de una fila visible. En pantallas angostas (`≤880px`) el maestro pasa arriba con un
`34dvh` de alto y el detalle abajo, cada uno con su scroll.

Qué se puede hacer desde la interfaz:

- Listar y **buscar clientes en vivo** (`?buscar=`, con 250 ms de retardo): el texto recorre
  nombre, apellido, email, domicilio, localidad y teléfono en una sola búsqueda. Al elegir un
  cliente se muestra su ficha y la primera de la lista se abre sola.
- **Agregar** y **Editar** clientes con el mismo formulario, que se abre **dentro del detalle**
  (en el lugar de la ficha, no en un modal): nombre y apellido, email y teléfono, domicilio y
  localidad, con Guardar y Cancelar debajo. Guardar pega contra la API (`POST` o `PATCH`) y
  después vuelve a pedir el maestro y la ficha, así los dos quedan al día; el alta además limpia
  la búsqueda para que el cliente nuevo aparezca en la lista. El pie del formulario queda fijo
  abajo, de modo que Guardar y Cancelar se ven incluso en ventanas bajas.
- **Borrar** clientes (arrastra sus actividades, con confirmación en dos toques).
- **Ver las actividades agrupadas**: arriba **Compromisos** y abajo **Actividades completadas**.
  Los compromisos van primero los que no tienen fecha, después los vencidos y al final los que
  vencen hoy o más adelante, y de menor a mayor dentro de cada grupo con fecha; las completadas van
  de la más reciente a la más vieja. Cada fila muestra el check a la izquierda, la descripción y
  debajo la fecha que le toca: el compromiso si sigue pendiente (o `Sin fecha de compromiso` si no
  tiene) o la finalización si ya se hizo, más la marca `vencida` cuando el plazo pasó. Un grupo sin
  filas se resuelve con una sola línea, sin ocupar alto.
- **Completar un compromiso desde el check**: el check de las filas pendientes es un botón; al
  marcarlo se llama a `POST …/completar`, se vuelve a pedir la lista y la actividad se muda al grupo
  de completadas con la fecha de hoy. Las filas completadas muestran el check pero ya no son
  accionables: no se pueden editar ni borrar, igual que en la API.
- **Agregar, editar y borrar compromisos** desde el subformulario, que queda justo debajo de la
  ficha: descripción, fecha de compromiso opcional y los botones con iconos para guardar y cancelar,
  todo en una línea, con borde punteado y sin etiquetas visibles. Guardar limpia el formulario y
  vuelve a pedir la lista de compromisos; cancelar también limpia (y recarga). Cada fila pendiente
  suma los iconos de editar y borrar: editar carga la descripción y la fecha en el subformulario (y
  marca la fila), borrar usa `ConfirmarBoton` en dos toques. Los nombres accesibles de los campos y
  de cada icono se anuncian con `aria-label`; el formulario se rotula solo (`Nuevo compromiso` /
  `Editar compromiso`) y desaparece mientras se crea o edita un cliente.
- **Filtrar las actividades por estado** y ver cuántas hay de cada uno: el filtro recorta lo que se
  ve dentro de los dos grupos. El maestro sigue sin mostrar actividades: el CRUD completo también
  está disponible en la API REST.
- Los errores de la API se muestran tal cual los devuelve (`400`, `404`, `409`) sin que la
  interfaz reimplemente ninguna regla: un email repetido se ve dentro del formulario y el
  formulario queda abierto para corregirlo.

Los conteos de cada filtro y el resumen de la ficha (`3 actividades · 1 vencida`) salen de
pedirle a la API los tres cortes por estado en paralelo, no de contar en el navegador. Para
agrupar y ordenar, la interfaz sí aplica la misma definición de vencida que el servicio
(`estadoDe`, contra la fecha del día): es lo único que decide por su cuenta, y las filas que
muestra son siempre las que devolvió la API. Las acciones irreversibles usan `ConfirmarBoton`: el
primer clic arma, el segundo ejecuta y a los 4 segundos se desarma solo.

### Pruebas de la interfaz

El HTML no lo cubre la suite de Vitest (se verificó a mano: alta, edición y borrado de clientes,
búsqueda, selección en el maestro, filtros por estado, grupos y orden de las actividades, conteos,
alta/edición/borrado de compromisos, completar con el check, formulario en blanco después de
guardar y cancelar, y errores, contra la API real).
Lo que sí está cubierto es el servido de la página: `tests/api.test.ts` comprueba que
`/MiniCRM.html` responde `text/html` y que `/` redirige a la página.

## Migraciones

```bash
npm run db:generate      # genera SQL desde src/db/schema.ts -> drizzle/
npm run db:migrate       # aplica las migraciones pendientes
npm run db:studio        # explorador visual de la base
```

Las migraciones se versionan en git; `data/*.db` no. Si `db:generate` pregunta si renombrar
o crear una tabla, revisa el cambio: suele significar que el esquema quedó con otro nombre.

## Pruebas

```bash
npm test                 # ejecuta la suite una vez (58 tests)
npm run test:watch       # modo watch
npm run typecheck        # verificación de tipos
```

Cada test abre una base `:memory:` nueva (`nuevaDb()` en `tests/test-db.ts`) y configura el
servicio con `ClienteRepository.configurar(db)`, sin mocks ni variables de entorno. La suite cubre
normalización, búsqueda por texto en cualquier campo, composición y borrado en cascada,
acceso a actividades solo a través de su cliente, completar (idempotente), vencidas, y el
bloqueo de edición/borrado de actividades completadas. Los tests de `tests/api.test.ts` levantan
la app con `supertest` (sin puerto) y verifican el contrato HTTP: 201/204, normalización,
búsqueda, 400/404/409, rutas anidadas y que una actividad de otro cliente no sea accesible.

## API del repositorio

El repositorio guarda la conexión, así que se configura una vez:

```ts
import { ClienteRepository } from "./servicios/cliente-repository.js";

ClienteRepository.configurar(db); // si no se llama, todo método falla con un mensaje claro
```

### Clientes (componente)

```ts
ClienteRepository.crear({ nombre: "ana  gómez", apellido: "GOMEZ", email: " Ana@Example.COM ", telefono: "+54 11 5555-1001" });
// → { nombre: "Ana Gómez", apellido: "Gomez", email: "ana@example.com", telefono: "+541155551001", ... }

ClienteRepository.listar();                    // ordenados por apellido y nombre
ClienteRepository.obtener(id);
ClienteRepository.buscar("rosario");  // un texto, en cualquiera de los campos
ClienteRepository.buscar("gó");       // parcial y sin distinguir mayúsculas
ClienteRepository.conActividades(id);          // cliente + actividades: la vista del componente 1:n
ClienteRepository.actualizar(id, { telefono: "+54 11 4444-0000" });  // parcial
ClienteRepository.eliminar(id);                // cliente + todas sus actividades, en una transacción
ClienteRepository.asegurar(datos);             // alta idempotente por email (la usa la semilla)
ClienteRepository.contar();
```

`buscar(texto)` recorre todos los campos de texto del cliente (`nombre`, `apellido`, `email`,
`domicilio`, `localidad`, `telefono`) y devuelve los que contienen el texto, **parcial y sin
distinguir mayúsculas**. Con texto vacío devuelve todos los clientes. Para traer uno por id
está `obtener(id)`.

### Actividades

Toda operación de actividad recibe **su `clienteId` como primer argumento**: no existe acceso
por id suelto, y si la actividad pertenece a otro cliente la operación no la encuentra.

```ts
ClienteRepository.crearActividad(clienteId, { descripcion: "Llamar al cliente" });   // nace pendiente
ClienteRepository.crearActividad(clienteId, { descripcion: "Enviar propuesta", fechaCompromiso: fecha });

ClienteRepository.listarActividades(clienteId, { estado: "vencida" }, hoy);  // criterios opcionales
ClienteRepository.obtenerActividad(clienteId, actividadId);
ClienteRepository.actualizarActividad(clienteId, actividadId, { descripcion: "Otra" }); // falla si está completada
ClienteRepository.completarActividad(clienteId, actividadId, fecha);   // asigna la fecha de finalización
ClienteRepository.eliminarActividad(clienteId, actividadId);           // falla si está completada
ClienteRepository.asegurarActividad(clienteId, datos);                 // alta idempotente por (cliente, descripción)
ClienteRepository.contarActividades(clienteId, criterios, hoy);

ClienteRepository.estaCompletada(actividad);
ClienteRepository.estaVencida(actividad, hoy);
ClienteRepository.resumen(clienteId, hoy);  // { cliente, actividades: { total, pendientes, completadas, vencidas, sinFecha } }
```

Criterios de búsqueda dentro del cliente: `id`, `descripcion`, `estado`
(`"pendiente" | "completada" | "vencida"`), `compromisoDesde`, `compromisoHasta` y
`sinFecha: true`.

El tipo `DatosActividad` (`Omit<NuevaActividad, "id" | "clienteId" | "fechaFinalizacion">`)
hace que el compilador impida pasar el dueño por el payload y una fecha de finalización:
el dueño es el primer argumento y la fecha solo la escribe `completarActividad`.
Los tipos `Cliente`, `NuevoCliente`, `Actividad` y `NuevaActividad` son inferidos por Drizzle
(`$inferSelect` / `$inferInsert`) en `src/db/schema.ts`.

## Notas de diseño

- **Síncrono a propósito**: `better-sqlite3` es síncrono, así que los métodos no usan
  `async/await`. Si cambias de driver, basta con devolver promesas en `src/db/client.ts`.
- **Las actividades se acceden por su cliente**: no existe `obtenerActividad(id)` ni
  `completarActividad(id)`. El `clienteId` es siempre el primer argumento y el `WHERE` lleva
  `cliente_id = ? AND id = ?`, de modo que el invariante no depende de que el llamador
  recuerde verificar la pertenencia.
- **Objetos devueltos = foto del momento**: `crearActividad` y `actualizarActividad`
  devuelven la fila tal como quedó al escribir. Volver a leer con
  `obtenerActividad(clienteId, actividadId)` es la forma de ver el estado actualizado.
- **HTTP fino**: `src/api/` traduce HTTP <-> servicio y nada más. El servicio no importa
  Express, y los controladores no reimplementan reglas: si una actividad está completada, la
  excepción sale del repositorio y un único middleware la convierte en `409`.
- **La interfaz es un cliente más**: `public/MiniCRM.html` no conoce la base ni el repositorio,
  solo la API REST. Por eso se sirve desde el mismo Express (mismo origen, sin CORS) y por eso
  no hay estado duplicado: después de cada escritura se vuelve a pedir la lista.
- **Integridad activada**: `foreign_keys = ON` y WAL en `createDb()`.
- **Colación de SQLite**: el orden es por bytes y no ignora acentos (`Á` va después de `Z`).
  Si necesitas ordenar acento-insensible, agrega una columna normalizada o un `COLLATE` con ICU.
- **Búsqueda con `LIKE`**: la insensibilidad a mayúsculas de SQLite cubre ASCII; para acentos
  funciona mientras la tilde tenga el mismo formato (`Gómez` vs `gómez`). Como los teléfonos
  se guardan solo con dígitos, conviene buscarlos con dígitos (`+54115555`, no `5555-1001`).
