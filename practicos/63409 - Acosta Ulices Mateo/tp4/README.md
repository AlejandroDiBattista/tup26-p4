# Trabajo Práctico N4

API REST de clientes y actividades hecha con **Node.js**, **TypeScript**, **Express** y **Drizzle ORM**.
En desarrollo usa una base de datos **SQLite local** (un archivo en tu PC) y en producción usa **Turso** (SQLite en la nube).

## ¿Qué es cada herramienta?

| Herramienta | Para qué sirve |
| --- | --- |
| **Node.js** | Ejecuta JavaScript fuera del navegador. |
| **TypeScript** | JavaScript con tipos: detecta errores antes de ejecutar el código. |
| **Express** | Framework para crear el servidor web y las rutas de la API. |
| **React** | Biblioteca para armar la interfaz web con componentes (se carga desde un CDN). |
| **Drizzle ORM** | Permite trabajar con la base de datos desde TypeScript, sin escribir todo el SQL a mano. |
| **SQLite** | Base de datos que se guarda en un solo archivo (`local.db`). |
| **Turso** | Servicio en la nube compatible con SQLite. Se usa en producción. |
| **libSQL** (`@libsql/client`) | El cliente que se conecta tanto al archivo local como a Turso. |

## Estructura del proyecto

```
├── src/
│   ├── db/
│   │   ├── index.ts      # Crea la conexión a la base de datos
│   │   ├── schema.ts     # Tablas: clientes y actividades
│   │   └── seed.ts       # Carga datos de ejemplo
│   ├── services/         # Reglas de negocio
│   │   ├── clientes.ts   # Clase Clientes: CRUD de clientes y actividades
│   │   ├── errores.ts    # Errores de negocio: NoEncontrado, NoPermitido
│   │   └── normalizar.ts # Limpia nombres, emails y teléfonos antes de guardar
│   ├── controllers/      # Leen la petición HTTP, llaman al servicio y responden
│   │   ├── clientes.ts
│   │   └── actividades.ts
│   ├── routers/          # Asocian cada URL y método HTTP con su controlador
│   │   ├── clientes.ts
│   │   └── actividades.ts
│   ├── app.ts            # Arma la app de Express y traduce errores a HTTP
│   └── index.ts          # Punto de entrada: inicia el servidor
├── test/
│   ├── setup.ts          # Prepara una base de pruebas vacía en memoria
│   ├── api.test.ts       # Pruebas de la API REST
│   ├── clientes.test.ts  # Pruebas del servicio Clientes
│   └── db.test.ts        # Prueba que la conexión funciona
├── public/
│   └── microcrm.html     # Interfaz web: React + JSX + CSS en un solo archivo
├── drizzle/              # Migraciones SQL generadas por drizzle-kit
├── drizzle.config.ts     # Configuración de drizzle-kit (migraciones)
├── .env.example          # Ejemplo de variables de entorno
├── tsconfig.json         # Configuración de TypeScript
└── package.json          # Dependencias y scripts
```

### Cómo elige la base de datos

En [src/db/index.ts](src/db/index.ts) la conexión se arma con dos variables de entorno:

- `DATABASE_URL`: dónde está la base.
  - `file:local.db` → archivo SQLite local (desarrollo).
  - `libsql://<tu-base>.turso.io` → Turso (producción).
- `DATABASE_AUTH_TOKEN`: token de acceso. Solo hace falta para Turso.

Si `DATABASE_URL` no está definida, se usa `file:local.db`.
El código es el mismo en los dos entornos: lo único que cambia es el valor de estas variables.

## Requisitos

- Node.js 22 o superior (`node -v` para ver tu versión).
- npm (viene con Node.js).

## Instalación

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo `.env` copiando el ejemplo:

   ```bash
   cp .env.example .env
   ```

   En Windows (PowerShell): `Copy-Item .env.example .env`

   Con los valores por defecto ya funciona en local: no hay que cambiar nada.

## Ejecución

### Desarrollo (SQLite local)

```bash
npm run dev
```

Ejecuta `src/index.ts` directamente con `tsx` y reinicia el servidor cada vez que guardas un archivo.
Si todo está bien, verás:

```
API escuchando en http://localhost:3000/api/clientes
MicroCRM en http://localhost:3000/microcrm.html
```

El puerto por defecto es 3000; para cambiarlo, define `PORT` en `.env`.
Antes de usar la API, crea las tablas y carga los datos de ejemplo (ver [Crear y sembrar la base de datos](#crear-y-sembrar-la-base-de-datos)).

### Producción (Turso)

1. Crear una base en [Turso](https://turso.tech) y obtener su URL y un token.
2. Definir las variables de entorno en el servidor (o en `.env`):

   ```
   DATABASE_URL=libsql://<tu-base>.turso.io
   DATABASE_AUTH_TOKEN=<tu-token>
   ```

3. Compilar y ejecutar:

   ```bash
   npm run build   # Convierte TypeScript (src/) en JavaScript (dist/)
   npm start       # Ejecuta dist/index.js con Node
   ```

## Pruebas

```bash
npm test
```

Usa el test runner que trae Node (`node:test`) a través de `tsx` para poder ejecutar TypeScript.
- [test/db.test.ts](test/db.test.ts) ejecuta `select 1` y comprueba que la base responde.
- [test/clientes.test.ts](test/clientes.test.ts) prueba el servicio `Clientes`: normalización, búsqueda, CRUD, estados de las actividades y que las completadas no se puedan modificar.
- [test/api.test.ts](test/api.test.ts) levanta la API en un puerto libre y la prueba con `fetch`: rutas, códigos de respuesta, la operación de completar y que se sirva `microcrm.html`.

Las pruebas del servicio y de la API no tocan tu `local.db`. [test/setup.ts](test/setup.ts) les da a cada una una base nueva **en memoria** (`:memory:`) con las migraciones aplicadas. Así cada archivo empieza vacío y pueden correr en paralelo sin pisarse.

Resultado esperado:

```
✔ sirve la página MicroCRM
✔ CRUD de clientes
✔ datos inválidos devuelven 400
✔ actividades de un cliente, incluso completarlas
✔ normaliza nombre, email y teléfono al crear
✔ busca por cualquier campo de forma parcial
✔ actualiza y borra un cliente con sus actividades
✔ calcula el estado de las actividades
✔ edita y borra actividades pendientes, pero no completadas
✔ una actividad solo se modifica desde su cliente
✔ se conecta a la base de datos
ℹ pass 11
ℹ fail 0
```

## Modelo de datos

Un **cliente** tiene una lista de **actividades** (relación 1 a n). Las actividades son parte del cliente: si se borra un cliente, se borran sus actividades (`onDelete: "cascade"`).

```
clientes (1) ────< actividades (n)
```

**clientes**

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `id` | entero (clave primaria) | sí |
| `nombre` | texto | sí |
| `apellido` | texto | sí |
| `email` | texto, único | sí |
| `domicilio` | texto | no |
| `localidad` | texto | no |
| `telefono` | texto | no |

**actividades**

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `id` | entero (clave primaria) | sí |
| `cliente_id` | entero (clave foránea a `clientes.id`) | sí |
| `descripcion` | texto | sí |
| `fecha_compromiso` | texto `YYYY-MM-DD` | no: nula = sin fecha |
| `fecha_finalizacion` | texto `YYYY-MM-DD` | no: nula = pendiente; se completa al terminar la actividad |

Las fechas se guardan como texto `YYYY-MM-DD` porque SQLite no tiene un tipo fecha. En ese formato se pueden ordenar y comparar como texto.

En [src/db/schema.ts](src/db/schema.ts) también se definen las *relations* de Drizzle. Con ellas se puede traer un cliente junto con sus actividades:

```ts
const lista = await db.query.clientes.findMany({ with: { actividades: true } });
```

## Servicio `Clientes`

Toda la lógica está en [src/services/clientes.ts](src/services/clientes.ts), en una clase con **métodos estáticos**: se usan directamente como `Clientes.crear(...)`, sin hacer `new Clientes()`. Los tipos (`Cliente`, `NuevoCliente`, `Actividad`, `NuevaActividad`) los infiere Drizzle a partir de las tablas, en [src/db/schema.ts](src/db/schema.ts). Si agregas un campo a una tabla, los tipos se actualizan solos.

### Clientes

| Método | Qué hace |
| --- | --- |
| `crear(datos)` | Crea un cliente y lo devuelve con su `id`. |
| `obtener(id)` | Devuelve el cliente con sus actividades. |
| `buscar(filtro)` | Busca clientes por cualquier campo o combinación de campos. |
| `actualizar(id, cambios)` | Modifica solo los campos que le pases. |
| `borrar(id)` | Borra el cliente y **todas** sus actividades, también las completadas. |

```ts
import { Clientes } from "./services/clientes.js";

const ana = await Clientes.crear({ nombre: "ana", apellido: "ruiz", email: "Ana@Mail.com" });
await Clientes.buscar({ localidad: "ros" });               // localidad contiene "ros"
await Clientes.buscar({ nombre: "ana", apellido: "ruiz" }); // se deben cumplir las dos
await Clientes.buscar();                                    // todos los clientes
```

**Búsqueda flexible:** en los campos de texto basta con una parte del valor (`"ros"` encuentra `"Rosario"`) y no importan las mayúsculas. El `id` se compara exacto. Si pasas varios campos, el cliente tiene que cumplir todos. Ojo: los acentos sí cuentan, así que `"lopez"` no encuentra `"López"`.

### Normalización

Antes de guardar o buscar, [src/services/normalizar.ts](src/services/normalizar.ts) limpia los datos:

| Campo | Entrada | Se guarda |
| --- | --- | --- |
| `nombre`, `apellido` | `"  maría   josé "` | `"María José"` |
| `email` | `" Ana@Mail.COM "` | `"ana@mail.com"` |
| `telefono` | `"(341) 555-0101"` | `"3415550101"` (solo dígitos) |
| `domicilio`, `localidad` | `"   "` | `null` (sin espacios sobrantes; vacío = `null`) |

Gracias a esto, `"Ana@Mail.com"` y `"ana@mail.com"` cuentan como el mismo email, y la base no deja registrar dos clientes con ese email.

### Actividades

| Método | Qué hace |
| --- | --- |
| `listarActividades(clienteId)` | Devuelve las actividades del cliente con su estado. |
| `agregarActividad(clienteId, datos)` | Agrega una actividad al cliente. |
| `actualizarActividad(clienteId, id, cambios)` | Modifica una actividad **pendiente**. |
| `completarActividad(clienteId, id, fecha?)` | Completa la actividad: le pone fecha de finalización (hoy, si no pasas otra). |
| `borrarActividad(clienteId, id)` | Borra una actividad **pendiente**. |
| `estado(actividad)` | Devuelve `"completada"`, `"vencida"` o `"pendiente"`. |

Los métodos de actividades reciben también el `clienteId`: así se comprueba que la actividad sea de ese cliente.

Reglas:

- **Completada:** tiene `fechaFinalizacion`.
- **Vencida:** no está completada y su `fechaCompromiso` es anterior a hoy.
- **Pendiente:** no está completada y no tiene fecha, o la fecha es hoy o más adelante.
- Una actividad completada **no se puede editar ni borrar** sola: `actualizarActividad` y `borrarActividad` lanzan un error. Solo se borra cuando se borra su cliente.

`obtener`, `buscar` y `listarActividades` devuelven cada actividad con su campo `estado` ya calculado:

```ts
const cliente = await Clientes.obtener(1);
cliente.actividades.map((a) => a.estado); // ["completada", "pendiente"]
```

### Errores

Cuando algo no se puede hacer, el servicio lanza uno de los errores de [src/services/errores.ts](src/services/errores.ts):

| Error | Cuándo |
| --- | --- |
| `NoEncontrado` | El cliente no existe, o la actividad no existe o no es de ese cliente. |
| `NoPermitido` | Se intenta editar o borrar una actividad completada. |

El servicio no sabe nada de HTTP: solo lanza estos errores. La API los traduce a códigos de respuesta.

## API REST

La API está hecha con Express y se organiza en tres capas. Cada una tiene una sola responsabilidad:

```
petición HTTP → router → controlador → servicio → base de datos
```

| Capa | Carpeta | Responsabilidad |
| --- | --- | --- |
| **Router** | [src/routers/](src/routers/) | Decide qué controlador atiende cada URL y método (`GET`, `POST`…). |
| **Controlador** | [src/controllers/](src/controllers/) | Lee los datos de la petición (`params`, `query`, `body`), llama al servicio y arma la respuesta. |
| **Servicio** | [src/services/](src/services/) | Reglas de negocio: normalizar, calcular estados, impedir editar completadas. |

Así, si mañana la misma lógica se usa desde otro lugar (una consola, otra API), el servicio no cambia.

El router de actividades se monta **dentro** del de clientes, en `/:clienteId/actividades`. Usa `Router({ mergeParams: true })` para poder leer el `:clienteId` del router padre.

### Rutas

Base: `http://localhost:3000`

**Clientes**

| Método | Ruta | Qué hace | Respuesta |
| --- | --- | --- | --- |
| `GET` | `/api/clientes` | Lista los clientes. Acepta filtros en la URL. | 200 |
| `GET` | `/api/clientes/:id` | Un cliente con sus actividades. | 200 |
| `POST` | `/api/clientes` | Crea un cliente. | 201 |
| `PATCH` | `/api/clientes/:id` | Modifica los campos enviados. | 200 |
| `DELETE` | `/api/clientes/:id` | Borra el cliente y sus actividades. | 204 |

**Actividades de un cliente**

| Método | Ruta | Qué hace | Respuesta |
| --- | --- | --- | --- |
| `GET` | `/api/clientes/:clienteId/actividades` | Lista las actividades con su estado. | 200 |
| `POST` | `/api/clientes/:clienteId/actividades` | Crea una actividad. | 201 |
| `PATCH` | `/api/clientes/:clienteId/actividades/:id` | Modifica una actividad pendiente. | 200 |
| `POST` | `/api/clientes/:clienteId/actividades/:id/completar` | Completa la actividad. Body opcional: `{ "fecha": "YYYY-MM-DD" }` (por defecto, hoy). | 200 |
| `DELETE` | `/api/clientes/:clienteId/actividades/:id` | Borra una actividad pendiente. | 204 |

Se usa `PATCH` y no `PUT` porque se actualizan solo los campos que se envían, no el registro entero.

### Códigos de error

Los errores se responden como JSON: `{ "error": "mensaje" }`. La traducción está en [src/app.ts](src/app.ts):

| Código | Cuándo |
| --- | --- |
| `400` | JSON mal formado, falta un campo obligatorio (*"Falta el campo obligatorio apellido"*) o el email ya existe (*"Ya existe un registro con ese email"*). |
| `404` | `NoEncontrado`: el cliente o la actividad no existe. |
| `409` | `NoPermitido`: la actividad está completada. |
| `500` | Cualquier otro error inesperado. |

### Ejemplos con `curl`

```bash
# Buscar clientes (mismos filtros que Clientes.buscar)
curl "http://localhost:3000/api/clientes?localidad=ros"

# Crear un cliente
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"ana","apellido":"ruiz","email":"Ana@Mail.com"}'

# Modificar el teléfono del cliente 1
curl -X PATCH http://localhost:3000/api/clientes/1 \
  -H "Content-Type: application/json" \
  -d '{"telefono":"(341) 555-9999"}'

# Agregar una actividad al cliente 1
curl -X POST http://localhost:3000/api/clientes/1/actividades \
  -H "Content-Type: application/json" \
  -d '{"descripcion":"Enviar propuesta","fechaCompromiso":"2026-12-01"}'

# Completar la actividad 7 del cliente 1
curl -X POST http://localhost:3000/api/clientes/1/actividades/7/completar
```

En Windows usa `curl.exe` en lugar de `curl` en PowerShell, o prueba las rutas con una extensión como *Thunder Client* o *REST Client* de VS Code.

## Interfaz web: MicroCRM

Con el servidor en marcha, abre **http://localhost:3000/microcrm.html**.

La página está organizada como **maestro / detalle**, igual que muchas aplicaciones de escritorio:

```
┌─ MicroCRM ─────────────────────────────────────────────────┐
│ ┌─ Clientes ─── 3 de 10 ┐ ┌─ Lucía Fernández ──────── #1 ┐ │
│ │ 🔍 buscar…    (fijo)  │ │ Ficha                (fija)  │ │
│ ├───────────────────────┤ │ ╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╮ │ │
│ │ Lucía Fernández       │ │ ┊ Nuevo…  dd/mm/aaaa  ✓ ✕ ┊ │ │
│ │ Martín Gómez   scroll │ │ ╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╯ │ │
│ │ …                     │ ├─ COMPROMISOS ───────────── 1 ┤ │
│ │                       │ │ ☐ Llamar para seguimiento ✎ 🗑│ │
│ │                       │ │   Compromiso para el …       │ │
│ │ …                     │ ├─ ACTIVIDADES COMPLETADAS ─ 1 ┤ │
│ │                       │ │ ☑ Enviar presupuesto  scroll │ │
│ └───────────────────────┘ └──────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

- **Maestro** (izquierda): buscador y lista de clientes. Arriba muestra cuántos coinciden ("3 de 10").
- **Detalle** (derecha): al elegir un cliente se ven su **ficha** y sus actividades, separadas en **Compromisos** y **Actividades completadas** (ver [Actividades](#actividades-en-el-detalle)). Debajo de la ficha hay un subformulario para cargar compromisos. El id aparece como `#1` arriba a la derecha.
- **Agregar** (cabecera del maestro) y **Editar** (cabecera del detalle) abren un formulario en el detalle. Ver [Agregar y editar](#agregar-y-editar).
- La página ocupa **toda la altura de la ventana**, como una app: la página nunca scrollea. Solo tienen scroll propio la lista de clientes y la de actividades, así el buscador y la ficha quedan siempre visibles.
- En pantallas angostas (celular), el maestro queda arriba y el detalle abajo, y la ficha pasa a dos columnas.

### Búsqueda en vivo

La lista se filtra mientras escribes. No espera a que pulses Enter ni hace una petición por tecla: la página ya tiene todos los clientes (los trajo `servicioClientes.listar()` al iniciar) y los filtra en el navegador.

- Busca en **todos los campos** de la ficha: nombre, apellido, email, teléfono, domicilio y localidad.
- No distingue mayúsculas ni **acentos**: `"lopez"` encuentra a "López".
- `#7` busca por id exacto.
- El teléfono está guardado solo con dígitos, así que se busca sin guiones: `221555`.

La función `coincide(entidad, campos, consulta)` hace esta comparación. Es genérica: recibe los campos que describen la entidad, igual que `Ficha` y `Editor`.

### Actividades en el detalle

Las actividades del cliente se muestran en dos grupos, uno debajo del otro:

1. **Compromisos**: las que no están completadas, en este orden:
   1. sin fecha de compromiso;
   2. vencidas (fecha anterior a hoy), de la más antigua a la más nueva;
   3. con fecha de hoy o futura, de la más cercana a la más lejana.
2. **Actividades completadas**: las que tienen fecha de finalización.

Cada fila tiene un **check** a la izquierda (marcado si está completada), la descripción y, debajo, una línea con la fecha:

| Situación | Línea de fecha |
| --- | --- |
| Completada | `Finalizada el 2026-08-30` |
| Pendiente sin fecha | `Sin compromiso` |
| Vencida | `Vencida el 2026-10-20` (en rojo) |
| Hoy o futura | `Compromiso para el 2026-11-05` |

El orden lo arma la función `ordenarCompromisos`. A cada actividad le asigna un número de grupo (0 = sin fecha, 1 = vencida, 2 = hoy o futura) y ordena primero por ese número y, si empatan, por fecha:

```js
const grupo = (a) => (!a.fechaCompromiso ? 0 : a.estado === "vencida" ? 1 : 2);
return [...actividades].sort(
  (a, b) => grupo(a) - grupo(b) || (a.fechaCompromiso ?? "").localeCompare(b.fechaCompromiso ?? ""),
);
```

Las fechas se pueden comparar como texto porque están en formato `YYYY-MM-DD`. Se usa `[...actividades]` para ordenar una **copia**, porque `sort` modifica el arreglo original y en React el estado no debe modificarse directamente.

El título de cada grupo queda fijo arriba al hacer scroll (`position: sticky`). Si un grupo está vacío, muestra un mensaje de una sola línea ("Sin compromisos", "Sin actividades completadas") que ocupa el mínimo espacio.

### Trabajar con compromisos

| Acción | Cómo | Llamada a la API |
| --- | --- | --- |
| **Agregar** | Escribir la descripción (y opcionalmente la fecha) en el subformulario y pulsar ✓ o Enter. | `POST /api/clientes/:id/actividades` |
| **Editar** | Icono ✎ de la fila: sus datos se cargan en el subformulario y la fila queda resaltada. Pulsar ✓. | `PATCH /api/clientes/:id/actividades/:actividadId` |
| **Completar** | Marcar el check de la fila. Pasa a "Actividades completadas" con la fecha de hoy. | `POST …/actividades/:actividadId/completar` |
| **Borrar** | Icono 🗑 de la fila. | `DELETE …/actividades/:actividadId` |

- El subformulario va **debajo de la ficha**, en una sola línea y con borde punteado: descripción, fecha y dos botones con icono (✓ guardar, ✕ cancelar).
- **Guardar** y **Cancelar** dejan el formulario vacío otra vez y quitan el resaltado de la fila que se estaba editando.
- Las **completadas no se pueden tocar**: no tienen botones, y su check es solo un dibujo, no un botón. La API también lo impide: responde `409` si se intenta modificarlas.
- Mientras editas los datos del cliente (botón **Editar** de la cabecera), el subformulario se oculta.

**Después de cada cambio se recarga el cliente desde la API** (`servicioClientes.obtener`). Así los estados (vencida, completada…) y el orden siempre son los que calcula el servidor, sin repetir esa lógica en la página.

**Cómo se carga un compromiso en el subformulario:** `DetalleCliente` guarda en `enEdicion` qué actividad se está editando. El subformulario recibe `key={enEdicion?.id ?? "nuevo"}`. Cuando la `key` cambia, React descarta el componente y crea uno nuevo, que arranca con los datos de esa actividad. Si es `null`, arranca vacío.

**Accesibilidad:** lo que no tiene texto visible tiene un nombre con `aria-label`, que leen los lectores de pantalla:

| Elemento | Nombre accesible |
| --- | --- |
| Campo descripción | "Descripción del compromiso" |
| Campo fecha | "Fecha de compromiso (opcional)" |
| Botones del subformulario | "Guardar compromiso", "Cancelar" |
| Check de un pendiente | "Completar «Llamar»" |
| Iconos de la fila | "Editar «Llamar»", "Borrar «Llamar»" |
| Check de una completada | "Completada" |

Los nombres de las filas incluyen la descripción. Así, en una lista, un lector de pantalla no lee "Editar, Editar, Editar…" sin decir de qué. `Boton` usa el mismo `aria-label` como `title`, para que también aparezca un *tooltip* al pasar el mouse.

### Agregar y editar

Los dos usan el mismo componente `Editor`, en el detalle, con este orden:

```
Nombre *      Apellido *
Email *       Teléfono
Domicilio     Localidad
[✓ Guardar]  ✕ Cancelar
```

Las dos columnas salen de `.formulario-campos` (`grid-template-columns: repeat(2, …)`). El orden de las filas es el de `camposCliente`. Los campos con `*` son obligatorios: el navegador no deja enviar el formulario si están vacíos.

`App` guarda en qué **modo** está el detalle:

| Modo | Se ve | Al guardar |
| --- | --- | --- |
| `"ver"` | Ficha y actividades del cliente seleccionado. | — |
| `"editar"` | El formulario con los datos del cliente, en lugar de la ficha. Las actividades siguen debajo. | `servicioClientes.actualizar` (`PATCH`). El cliente se reemplaza en la lista, y el maestro y la ficha se actualizan solos. |
| `"agregar"` | Panel "Nuevo cliente" con el formulario vacío. | `servicioClientes.crear` (`POST`). El cliente nuevo se agrega a la lista y queda seleccionado. |

Al guardar se muestra lo que **devolvió la API**, no lo que se escribió. Por eso los datos aparecen ya normalizados: si escribes `"  ana  maría"`, la ficha muestra `"Ana María"`.

Cancelar vuelve al modo `"ver"` sin guardar nada. Elegir otro cliente en el maestro también cancela la edición.

Si la API rechaza los datos (por ejemplo, un email que ya existe), el formulario queda abierto y muestra el mensaje: *"Ya existe un registro con ese email"*.

### Cómo se sirve

En [src/app.ts](src/app.ts), `express.static` publica los archivos de la carpeta `public/`. La página y la API salen del mismo servidor (mismo origen), así que la página puede llamar a `/api/clientes` sin configurar nada más (sin CORS).

### Un solo archivo, sin instalar nada

[public/microcrm.html](public/microcrm.html) es **autocontenido**: el CSS, el JSX y los componentes están dentro del mismo archivo. No hay paso de compilación con npm: las bibliotecas se cargan desde un CDN con **versiones fijas**, para que la página no cambie sola si sale una versión nueva:

| Biblioteca | Versión | Para qué |
| --- | --- | --- |
| `react` | 18.3.1 | Componentes y estado. |
| `react-dom` | 18.3.1 | Dibuja los componentes en la página. |
| `@babel/standalone` | 7.24.7 | Convierte el JSX en JavaScript dentro del navegador. |

### Babel con runtime *classic*

El navegador no entiende JSX (`<Boton />`). Babel lo traduce a JavaScript. La página registra un preset propio con la opción `runtime: "classic"`:

```js
Babel.registerPreset("jsx-clasico", {
  presets: [[Babel.availablePresets.react, { runtime: "classic" }]],
});
```

y el código usa ese preset con `<script type="text/babel" data-presets="jsx-clasico">`.

Con `runtime: "classic"`, `<Boton>Guardar</Boton>` se convierte en `React.createElement(Boton, null, "Guardar")`. Usa la variable global `React` que dejó el `<script>` del CDN. El runtime nuevo (*automatic*) agregaría un `import` de `react/jsx-runtime`, y eso no funciona sin un empaquetador.

> Babel en el navegador es cómodo para aprender, pero más lento. En la consola verás un aviso que lo recuerda; es normal.

### Organización del código

El `<script>` de la página está dividido en secciones, de lo más genérico a lo más específico:

| Sección | Componentes / funciones | Qué hace |
| --- | --- | --- |
| **Servicios** | `pedir`, `peticion`, `servicioClientes` (`listar`, `obtener`, `crear`, `actualizar`), `servicioActividades` (`crear`, `actualizar`, `completar`, `borrar`) | Únicas funciones que hacen `fetch` a la API. Si la API devuelve un error, lanzan una excepción con su mensaje. |
| **Base** | `Icono`, `Boton`, `Entrada`, `Campo`, `Buscador`, `Formulario` | Piezas visuales reutilizables: iconos SVG, botones (`primario`, `secundario`, `fantasma`), caja de texto, campo con etiqueta, caja de búsqueda con icono y formulario con acciones. |
| **Layout** | `Layout`, `Panel`, `Grupo` | Estructura maestro/detalle a toda la altura, tarjetas con cabecera fija y secciones con título y cantidad. |
| **Entidades** | `Lista`, `Ficha`, `Editor`, `coincide` | Genéricos para **listar**, **mostrar**, **editar** y **buscar** en cualquier entidad. |
| **Dominio** | `camposCliente`, `Persona`, `Actividad`, `SubformularioActividad`, `fechaActividad`, `ordenarCompromisos`, `MaestroClientes`, `DetalleCliente`, `NuevoCliente` | Lo específico de clientes y actividades. |
| **Aplicación** | `App` | Carga los clientes al iniciar, guarda cuál está seleccionado y en qué modo está el detalle. |

Los componentes de **Entidades** no saben qué es un cliente. Reciben una lista de campos que describe la entidad:

```js
const camposCliente = [
  { clave: "nombre", etiqueta: "Nombre", requerido: true },
  { clave: "email", etiqueta: "Email", tipo: "email", requerido: true },
  // ...
];

<Ficha campos={camposCliente} valores={cliente} />    // mostrar
<Editor campos={camposCliente} inicial={cliente} ... /> // editar
```

Para otra entidad alcanza con definir sus campos: `Ficha` y `Editor` sirven igual. `Lista` recibe una función `render` que dibuja cada elemento. Se usa para la lista de clientes y para la de actividades.

### Estilo

CSS puro, sin frameworks ni librerías de componentes. Los colores, radios y sombras se definen una sola vez como variables (`--fondo`, `--acento`, …) en `:root`. Si el sistema está en **modo oscuro**, un `@media (prefers-color-scheme: dark)` cambia esas variables.

Para ocupar la altura de la ventana con scroll interno:

1. `html`, `body` y `#raiz` tienen `height: 100%`.
2. `.layout` es una columna flex: la cabecera mide lo que necesita y `.layout-cuerpo` se queda con el resto (`flex: 1`).
3. Cada `.panel` también es una columna flex. Las partes fijas (cabecera, buscador, ficha) miden lo que necesitan. La zona `.desplazable` ocupa el espacio que sobra y tiene `overflow-y: auto`.
4. `min-height: 0` es la clave: sin eso, un hijo flex o grid no se achica por debajo de su contenido y, en vez de aparecer el scroll interno, la página entera se alarga.

## Crear y sembrar la base de datos

```bash
npm run db:migrate   # Crea las tablas (aplica las migraciones de drizzle/)
npm run db:seed      # Carga 10 clientes y 15 actividades de ejemplo
```

Las actividades de ejemplo incluyen tareas completadas, pendientes con fecha y pendientes sin fecha.

**Sin duplicados:** puedes ejecutar `npm run db:seed` varias veces. Cada registro tiene un `id` fijo y se inserta con `onConflictDoNothing()`: si el `id` ya existe, Drizzle no lo vuelve a insertar.

## Migraciones (cambios en las tablas)

Si cambias [src/db/schema.ts](src/db/schema.ts):

```bash
npm run db:generate   # Genera los archivos SQL de migración en drizzle/
npm run db:migrate    # Aplica esas migraciones a la base configurada en DATABASE_URL
```

Para aplicarlas en Turso, ejecuta `db:migrate` con las variables de Turso configuradas.

## Resumen de scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Ejecuta en modo desarrollo y reinicia al guardar cambios. |
| `npm run build` | Compila TypeScript a JavaScript en `dist/`. |
| `npm start` | Ejecuta la versión compilada. |
| `npm test` | Corre las pruebas. |
| `npm run db:generate` | Genera migraciones a partir del esquema. |
| `npm run db:migrate` | Aplica las migraciones a la base de datos. |
| `npm run db:seed` | Carga los datos de ejemplo sin duplicarlos. |
