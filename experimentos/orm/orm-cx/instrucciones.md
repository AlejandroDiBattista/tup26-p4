# Clase: Node.js, Drizzle, SQLite y Turso

## Pautas para los ejemplos

- Usar ejemplos simples, breves y enfocados en un concepto a la vez.
- Documentar en este archivo los pasos que vamos realizando.
- Agregar funcionalidades solo cuando se soliciten durante la clase.

## 1. Qué usamos

- **Node.js:** ejecuta nuestro código JavaScript.
- **SQLite:** base de datos relacional que podemos guardar en un archivo.
- **Drizzle ORM:** permite definir tablas y consultar datos desde JavaScript.
- **Turso:** permite alojar una base compatible con SQLite en la nube.
- **@libsql/client:** conecta Drizzle con el archivo local o con Turso.

Usamos TypeScript con módulos (`import` y `export`).

## 2. Instalar y configurar

```sh
npm install drizzle-orm @libsql/client dotenv
npm install -D drizzle-kit typescript tsx @types/node
cp .env.example .env
```

Para comenzar, `.env` apunta a un archivo local:

```env
TURSO_DATABASE_URL=file:clase.db
TURSO_AUTH_TOKEN=
```

## 3. Archivos del ejemplo

- `schema.ts`: define las tablas `clientes` y `actividades`.
- `db.ts`: abre la conexión y crea el objeto `db` de Drizzle.
- `drizzle.config.ts`: indica a Drizzle Kit dónde está el esquema y a qué base conectarse.
- `index.ts`: crea un cliente, agrega una actividad pendiente, la completa y consulta sus actividades.

## 4. Crear la tabla

```sh
npm run db:push
```

Drizzle Kit lee `schema.ts` y aplica el esquema a la base configurada. Usamos `push` para mantener sencillo este primer ejemplo.

## 5. Insertar y consultar

```sh
npm start
```

El ejemplo crea a Ana Pérez si su email no existe. Después agrega una actividad pendiente, muestra sus datos, registra su finalización y lista las actividades de Ana. Cada ejecución agrega una actividad nueva.

## 6. Conectar a Turso

Con una base creada en Turso, obtener su URL y su token desde el panel o desde la CLI autenticada:

```sh
turso db show NOMBRE_DE_LA_BASE --url
turso db tokens create NOMBRE_DE_LA_BASE
```

Reemplazar en `.env`:

```env
TURSO_DATABASE_URL=libsql://URL_DE_TU_BASE
TURSO_AUTH_TOKEN=TU_TOKEN
```

Luego ejecutar `npm run db:push` y `npm start`. El mismo código trabajará con la base remota. `.env` está excluido de Git para no publicar el token.

## 7. Verificación realizada

Se instalaron las dependencias, se creó la tabla en SQLite local con `npm run db:push` y se ejecutó `npm start`. La consulta mostró a `Ana` con `id` 1. La conexión remota queda pendiente de configurar con la URL y el token de Turso.

## 8. Conversión a TypeScript

Renombramos los cuatro archivos `.js` a `.ts` y actualizamos la configuración de Drizzle.

- `tsx` ejecuta el ejemplo TypeScript con `npm start`.
- `typescript` revisa los tipos con `npm run check`.
- `@types/node` aporta los tipos de Node.js, como `process.env`.
- `tsconfig.json` activa la revisión estricta y los módulos de Node.js.

Los imports conservan `.js` por la convención de módulos `NodeNext`; TypeScript y `tsx` los resuelven a los archivos `.ts`.

La conexión usa `process.env.TURSO_DATABASE_URL || 'file:clase.db'`: si no configuramos una URL, utiliza SQLite local.

Drizzle infiere los tipos de la tabla y de las consultas; no necesitamos declarar interfaces adicionales para este ejemplo.

```sh
npm run check
npm run db:push
npm start
```

Verificación: la revisión de tipos pasó, Drizzle confirmó que el esquema no cambió y el ejemplo insertó y consultó alumnos en SQLite local.

## 9. Desarrollo local

La aplicación y Drizzle Kit usan `file:clase.db` por defecto. Podemos desarrollar sin cuenta de Turso, sin token y sin conexión a Internet una vez instaladas las dependencias.

```sh
npm run db:push
npm start
```

Los datos se guardan en `clase.db` y se conservan entre ejecuciones. Para trabajar localmente, dejar `TURSO_DATABASE_URL=file:clase.db` en `.env`, o no definir esa variable. Una URL remota en `.env` tiene prioridad sobre el valor por defecto.

## 10. MiniCRM: clientes y actividades

Un cliente puede tener muchas actividades. Cada actividad pertenece a un cliente mediante `clienteId`, una clave foránea.

| Cliente              | Regla                          |
| -------------------- | ------------------------------ |
| `id`                 | Se genera automáticamente      |
| `nombre`, `apellido` | Obligatorios                   |
| `telefono`           | Opcional; se guarda como texto |
| `email`              | Obligatorio y único            |

| Actividad         | Regla                                                          |
| ----------------- | -------------------------------------------------------------- |
| `id`              | Se genera automáticamente                                      |
| `clienteId`       | Cliente asociado, obligatorio                                  |
| `descripcion`     | Obligatoria                                                    |
| `fecha`           | Opcional, fecha de la actividad en formato `AAAA-MM-DD`        |
| `fechaCompromiso` | Opcional, día previsto para realizarla en formato `AAAA-MM-DD` |
| `completadaEn`    | Fecha y hora de finalización, o `null` mientras está pendiente |

Usamos `completadaEn` para representar el estado: `null` significa pendiente; una fecha significa realizada o cerrada. Así evitamos mantener un booleano que pueda contradecir la fecha. Al completarla, asignamos `new Date()`. Drizzle convierte esa fecha a un entero en milisegundos para SQLite.

En este primer modelo, cerrar y realizar significan completar la actividad. La fecha de finalización se registra siempre al completarla, aunque no se haya indicado `fecha` ni `fechaCompromiso`.

El esquema del ejemplo ahora corresponde al CRM. `tablesFilter` en `drizzle.config.ts` limita los cambios a `clientes` y `actividades`, conservando la tabla anterior `alumnos`.

Verificado en una base SQLite temporal: tipos correctos, creación de tablas, actividad pendiente sin fechas, finalización con fecha y consulta por cliente. La base rechazó un email duplicado y una actividad asociada a un cliente inexistente. La base anterior de la clase no fue modificada.

## 11. Alineación de campos

Alineamos las definiciones de los campos en `schema.ts` y las columnas de sus descripciones en este documento para facilitar la lectura durante la clase.

## 12. Semilla de datos

`seed.ts` carga 10 clientes ficticios con emails únicos y teléfonos opcionales. Cada cliente nuevo recibe 3 actividades:

1. Una llamada completada, con fecha y fecha de finalización.
2. Una propuesta pendiente, con fecha de compromiso.
3. Un seguimiento pendiente, sin fechas.

```sh
npm run db:push
npm run db:seed
```

La semilla usa la base configurada en `.env`, local por defecto. Si un email ya existe, omite ese cliente y sus actividades para no duplicarlos ni modificar sus datos. En una base vacía agrega 10 clientes y 30 actividades. Todos los registros se insertan dentro de una transacción: si algo falla, se deshace la carga.

## 13. Instalación y ejecución en la base local

Ejecutamos:

```sh
npm install
npm run check
npm run db:push
npm run db:seed
npm start
```

Las tablas del CRM se crearon en `clase.db`, conservando los datos anteriores. La semilla agregó 10 clientes y 30 actividades. El ejemplo agregó a Ana Pérez y una actividad, mostró su estado pendiente y luego su fecha de finalización. Resultado: 11 clientes y 31 actividades.

## 14. Capa de negocio con repositorios

Creamos `Clientes` y `Actividades`, una clase por entidad. Todos sus métodos son estáticos: se usan directamente, sin crear instancias con `new`.

Ambos repositorios ofrecen:

- `listar()`: devuelve todos los clientes; para actividades se usa `listar(clienteId)`.
- `obtener(id)`: devuelve un registro, o `undefined` si no existe.
- `crear(datos)`: inserta y devuelve el registro creado.
- `actualizar(id, datos)`: modifica los campos indicados y devuelve el registro actualizado, o `undefined` si no existe.
- `eliminar(id)`: devuelve `true` si eliminó el registro y `false` si no existía.

`Clientes` también permite `buscarPorEmail(email)`. `Actividades` agrega `listar(clienteId)` y `completar(id)`, que registra la fecha y hora de finalización.

```ts
const cliente = await Clientes.crear({
  nombre: 'Lucía',
  apellido: 'Gómez',
  email: 'lucia@example.com',
});

const actividad = await Actividades.crear({
  clienteId: cliente.id,
  descripcion: 'Enviar propuesta',
});

await Actividades.completar(actividad.id);
```

Los tipos de los datos se infieren del esquema de Drizzle. `Omit` excluye el `id` generado y `Partial` permite actualizar solo algunos campos. Las restricciones de email único y cliente asociado siguen controladas por SQLite. Los errores se propagan al código que llama al repositorio. La relación es de composición: al eliminar un cliente, SQLite elimina sus actividades en cascada.

`index.ts` ahora utiliza los repositorios para ejecutar el mismo ejemplo. `seed.ts` mantiene su transacción de carga con Drizzle.

Verificado en SQLite temporal: creación, lectura, actualización y eliminación de ambas entidades; búsqueda por email; actividades por cliente; finalización con fecha; rechazo de email duplicado. La eliminación de clientes fue adaptada posteriormente a composición. También pasó `npm run check` y se ejecutó el ejemplo actualizado.

## 15. Búsqueda flexible de clientes

Agregamos `Clientes.buscar(texto)`. Devuelve los clientes que contienen el texto en cualquiera de sus campos: `id`, `nombre`, `apellido`, `telefono` o `email`.

```ts
const encontrados = await Clientes.buscar('ana');
console.table(encontrados);
```

Usamos `like` con el patrón `%texto%`: el símbolo `%` permite que haya otros caracteres antes o después del texto. `or` combina una condición por campo; basta con que una coincida. SQLite permite aplicar `LIKE` también al id numérico.

```ts
const patron = `%${texto}%`;

return db.select().from(clientes).where(or(
  like(clientes.id, patron),
  like(clientes.nombre, patron),
  like(clientes.apellido, patron),
  like(clientes.telefono, patron),
  like(clientes.email, patron),
));
```

Un texto vacío devuelve todos los clientes y una búsqueda sin coincidencias devuelve un array vacío. El teléfono opcional no impide buscar en los demás campos. SQLite ignora mayúsculas ASCII en `LIKE`, pero no normaliza acentos. En esta versión sencilla, `%` y `_` escritos en el texto funcionan como comodines SQL.

Simplificamos la implementación quitando `map`, `cast`, `instr` y `lower`. Verificamos los tipos y las búsquedas en los cinco campos sin modificar los datos.

## 16. Organización de repositorios

Movimos los repositorios a una carpeta y simplificamos los nombres:

```text
repositorios/
  clientes.ts      → clase Clientes
  actividades.ts   → clase Actividades
```

El ejemplo importa las clases desde esa carpeta:

```ts
import { Clientes } from './repositorios/clientes.js';
import { Actividades } from './repositorios/actividades.js';
```

Actualizamos las rutas internas y la configuración de TypeScript para incluir la carpeta. Los métodos y su comportamiento se mantienen.

## 17. Validación y formato de clientes

Al crear o actualizar un cliente:

- Nombre y apellido no pueden ser `null`, estar ausentes al crear, ni contener solo espacios.
- Quitamos espacios en los extremos y dejamos uno solo entre palabras.
- Normalizamos nombres a inicial mayúscula, conservando acentos, guiones y apóstrofos. Las partículas `de`, `del`, `la`, `las`, `los` e `y` quedan en minúscula: `MARÍA   JOSÉ` → `María José`, `DE LA CRUZ` → `de la Cruz`. Es una convención sencilla para la clase; no contempla todas las excepciones de nombres propios.
- El teléfono sigue siendo opcional: vacío o `null` se guarda como `null`.

Instalamos `libphonenumber-js` para interpretar teléfonos de Argentina sin escribir reglas manuales para cada código de área:

```sh
npm install libphonenumber-js
```

Se guarda el formato internacional con espacios:

- `3815550101` → `+54 381 555 0101`.
- `0381 15 5550101` → `+54 9 381 555 0101`.
- `011 4321-5678` → `+54 11 4321 5678`.

Hay que incluir el código de área. No agregamos el prefijo móvil `9` a un número que no lo identifica como celular. Se rechazan números inválidos, de otros países o con extensiones. Un número válido por formato no garantiza que la línea exista.

Las funciones auxiliares están en `repositorios/clientes.ts` y se usan tanto en creación como en actualización. La semilla también contiene los teléfonos ya formateados.

Verificamos nombres nulos, vacíos y con espacios; acentos y partículas; actualizaciones parciales; teléfonos fijos, móviles, vacíos e inválidos.

Referencias: [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) y [formato telefónico argentino](https://cancilleria.gob.ar/es/iniciativas/paba/telecomunicaciones).

## 18. Normalización de emails

`normalizarEmail` quita los espacios de los extremos y convierte el email a minúsculas: `  ANA@EXAMPLE.COM  ` → `ana@example.com`.

Se aplica en `Clientes.crear`, `Clientes.actualizar` y `Clientes.buscarPorEmail`. El email no puede ser nulo ni vacío. La restricción única de SQLite impide guardar dos emails que resulten iguales después de normalizarlos. No quitamos espacios internos ni cambiamos puntos o etiquetas de la dirección.

Verificamos creación, actualización, búsqueda con mayúsculas y espacios, rechazo de valores vacíos y unicidad. También revisamos los emails existentes y pasó la verificación de tipos.

## 19. Listados de tareas

Agregamos tres métodos estáticos a `Actividades`. Todos reciben el `clienteId` obligatorio y consultan solo sus actividades:

- `listarPendientes(clienteId)`: actividades con `completadaEn` igual a `null`.
- `listarVencidas(clienteId)`: pendientes con fecha de compromiso anterior a hoy.
- `listarSinCompromiso(clienteId)`: pendientes con `fechaCompromiso` igual a `null`.

```ts
console.table(await Actividades.listarPendientes(clienteId));
console.table(await Actividades.listarVencidas(clienteId));
console.table(await Actividades.listarSinCompromiso(clienteId));
```

Las fechas de compromiso se guardan como `AAAA-MM-DD`, por lo que podemos compararlas con `lt` (menor que). `isNull` verifica que una fecha esté vacía y `and` exige que se cumplan ambas condiciones.

Para calcular hoy usamos la zona horaria de Tucumán. Una actividad comprometida para hoy todavía no está vencida. Las completadas no aparecen en ninguno de estos tres listados; una pendiente sin compromiso tampoco cuenta como vencida.

Verificamos los tipos y los filtros en SQLite temporal con actividades vencidas, futuras, de hoy, sin compromiso y completadas.

## 20. Actividades en el contexto de un cliente

Todos los listados de actividades requieren `clienteId`. Reemplazamos `listarPorCliente` por `listar(clienteId)` para evitar dos métodos con el mismo propósito.

```ts
const actividades = await Actividades.listar(cliente.id);
const pendientes = await Actividades.listarPendientes(cliente.id);
const vencidas = await Actividades.listarVencidas(cliente.id);
const sinCompromiso = await Actividades.listarSinCompromiso(cliente.id);
```

Cada consulta filtra por el cliente además de las condiciones del estado. Verificamos con dos clientes que ningún listado incluya actividades del otro. La revisión de tipos también pasó.

## 21. Composición entre clientes y actividades

Las actividades son parte del cliente y su ciclo de vida depende de él. Cada actividad requiere un cliente existente y se elimina al eliminar ese cliente.

La clave foránea usa `onDelete: 'cascade'`. Por eso `Clientes.eliminar(clienteId)` elimina automáticamente todas sus actividades, sin necesitar borrarlas una por una desde el repositorio.

Aplicamos el cambio a la base local. Verificamos en una base temporal que eliminar un cliente borra sus actividades, conserva las de otros clientes y no permite crear actividades para clientes inexistentes.

## 22. Visualización del modelo

Creamos `estructura.html`, un archivo autocontenido que se abre directamente en el navegador, sin servidor ni dependencias externas.

Muestra las dos entidades, sus campos, tipos y reglas, la relación de uno a muchos y la composición con eliminación en cascada. También explica las fechas y cómo se determinan los estados de las actividades. El diagrama es estático y representa el esquema de esta clase.

## Referencia

[Documentación oficial de Drizzle con Turso](https://orm.drizzle.team/docs/get-started/turso-new).

## 23. API REST con Express

Instalamos Express para recibir solicitudes HTTP y responder con datos JSON:

```sh
npm install express
npm install -D @types/express
```

Separamos la API en tres capas:

```text
manejadores/   → reciben la solicitud y llaman a los repositorios
routers/       → relacionan cada ruta HTTP con su manejador
repositorios/  → consultan y modifican la base de datos
servidor.ts    → configura Express y monta los routers
```

`npm start` levanta el servidor en `http://localhost:3000`. Se puede elegir otro puerto con la variable `PORT`.

### Rutas de clientes

| Método | Ruta | Función |
| --- | --- | --- |
| `GET` | `/api/clientes` | Lista los clientes |
| `GET` | `/api/clientes/buscar?texto=ana` | Busca en los campos del cliente |
| `GET` | `/api/clientes/:id` | Obtiene un cliente |
| `POST` | `/api/clientes` | Crea un cliente |
| `PATCH` | `/api/clientes/:id` | Actualiza los campos enviados |
| `DELETE` | `/api/clientes/:id` | Elimina el cliente y sus actividades |

Ejemplo de creación, enviando JSON:

```sh
curl -X POST http://localhost:3000/api/clientes \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Lucía","apellido":"Gómez","email":"lucia@example.com"}'
```

### Rutas de actividades

| Método | Ruta | Función |
| --- | --- | --- |
| `GET` | `/api/actividades/cliente/:clienteId` | Lista las actividades del cliente |
| `GET` | `/api/actividades/cliente/:clienteId/pendientes` | Lista las pendientes |
| `GET` | `/api/actividades/cliente/:clienteId/vencidas` | Lista las vencidas |
| `GET` | `/api/actividades/cliente/:clienteId/sin-compromiso` | Lista las pendientes sin fecha de compromiso |
| `GET` | `/api/actividades/:id` | Obtiene una actividad |
| `POST` | `/api/actividades` | Crea una actividad |
| `PATCH` | `/api/actividades/:id` | Actualiza los campos enviados |
| `POST` | `/api/actividades/:id/completar` | Marca la actividad como completada |
| `DELETE` | `/api/actividades/:id` | Elimina una actividad |

Ejemplo para crear una actividad:

```sh
curl -X POST http://localhost:3000/api/actividades \
  -H 'Content-Type: application/json' \
  -d '{"clienteId":1,"descripcion":"Enviar propuesta"}'
```

La API devuelve `201` al crear, `204` al eliminar, `400` para ids inválidos y `404` cuando el registro no existe. Los errores de validación de clientes se responden con `400`; los demás errores de base de datos, con `500`.

Para iniciar el servidor:

```sh
npm start
```

## 24. Actividades dentro del repositorio y las rutas de clientes

Las actividades forman parte de la información de un cliente. Por eso, sus métodos están en `Clientes` y siempre reciben el `clienteId`. Al consultar, actualizar, completar o eliminar una actividad, el repositorio usa ambos ids; una actividad de otro cliente no se puede operar mediante esa ruta.

El CRUD de actividades se expone anidado bajo el cliente:

| Método | Ruta | Función |
| --- | --- | --- |
| `GET` | `/api/clientes/:clienteId/actividades` | Lista las actividades del cliente |
| `GET` | `/api/clientes/:clienteId/actividades/pendientes` | Lista las pendientes |
| `GET` | `/api/clientes/:clienteId/actividades/vencidas` | Lista las vencidas |
| `GET` | `/api/clientes/:clienteId/actividades/sin-compromiso` | Lista las pendientes sin compromiso |
| `GET` | `/api/clientes/:clienteId/actividades/:actividadId` | Obtiene una actividad del cliente |
| `POST` | `/api/clientes/:clienteId/actividades` | Crea una actividad para el cliente |
| `PATCH` | `/api/clientes/:clienteId/actividades/:actividadId` | Actualiza una actividad del cliente |
| `POST` | `/api/clientes/:clienteId/actividades/:actividadId/completar` | Completa una actividad del cliente |
| `DELETE` | `/api/clientes/:clienteId/actividades/:actividadId` | Elimina una actividad del cliente |

El `clienteId` se toma de la ruta al crear la actividad; no hace falta incluirlo en el JSON:

```sh
curl -X POST http://localhost:3000/api/clientes/1/actividades \
  -H 'Content-Type: application/json' \
  -d '{"descripcion":"Enviar propuesta"}'
```

Se quitó el router independiente `/api/actividades`. Si el cliente no existe, la API responde `404`; si la actividad no pertenece a ese cliente, también responde `404`.

## 25. Página web para listar clientes

Creamos `public/clientes.html`, una página autocontenida que carga React, ReactDOM y Babel Standalone desde CDN. Babel transforma el JSX embebido con `transform-react-jsx` y `React.createElement`, en modo clásico y sin módulos. El componente consulta `GET /api/clientes` y muestra nombre, email y teléfono; también presenta estados de carga, error y lista vacía, además de un botón para actualizar el listado.

Express sirve la carpeta `public`, así que con el servidor iniciado se abre en:

```text
http://localhost:3000/clientes.html
```

La página usa una disposición adaptable a pantallas pequeñas y no necesita un proceso de compilación de frontend.

Fijamos Babel Standalone en la versión `7.26.9` y registramos el preset `react-clasico` con `runtime: 'classic'`. Así el JSX embebido genera llamadas a `React.createElement`, sin imports de `react/jsx-runtime`. Verificamos la transformación del componente completo con esa misma versión del CDN: JavaScript válido y sin imports.

## 26. Componentes de la página

Dividimos el JSX en componentes dentro del mismo HTML. `LayoutPagina`, `Marca`, `Encabezado` y `SeccionListado` organizan la página mediante props y `children`. `ContadorClientes`, `ListadoClientes`, `FilaCliente`, `AvatarCliente`, `DatosCliente` y `TelefonoCliente` muestran los datos. `BotonActualizar`, `IconoActualizar` y `MensajeEstado` presentan la acción y los estados del listado.

`App` conserva el estado y la consulta al API; pasa los datos y el callback `onActualizar` a los componentes. La página sigue siendo autocontenida y conserva su diseño y comportamiento.

## 27. Maestro y detalle

El panel maestro incluye búsqueda en vivo sobre los campos de los clientes ya cargados y botones para seleccionarlos. El detalle muestra ID, nombre, apellido, email y teléfono, y consulta `GET /api/clientes/:clienteId/actividades`. Las actividades muestran descripción, estado, fecha, compromiso y finalización como información de solo lectura.

`LayoutMaestroDetalle` organiza ambos paneles; `BusquedaClientes`, `DetalleCliente`, `ActividadesCliente`, `Actividad` y `CampoDato` separan sus responsabilidades. Al cambiar de cliente se cancela la consulta anterior de actividades. En pantallas pequeñas los paneles se apilan.

Quitamos el botón de actualizar. El maestro tiene altura limitada y scroll interno en la lista, dejando visible la búsqueda. Cada actividad presenta un checkbox deshabilitado que indica si está completada, su descripción y, debajo, la fecha de compromiso si está pendiente o la fecha de finalización si está completada. Las pendientes sin compromiso muestran «Sin fecha de compromiso».

El ID del cliente se muestra como `#123` en la esquina superior derecha del detalle. Al marcar una actividad pendiente, enviamos `POST /api/clientes/:clienteId/actividades/:actividadId/completar` y actualizamos la fila con la respuesta del API. El check queda deshabilitado mientras guarda y después de completarla. Si falla, muestra el error y permite reintentar.

El botón «Editar» convierte el detalle en un formulario de nombre, apellido, email y teléfono. «Guardar» envía `PATCH /api/clientes/:id`, actualiza el maestro y el detalle con los datos devueltos y vuelve a la vista de consulta. «Cancelar» descarta la edición. Los errores mantienen el formulario abierto y los valores ingresados; mientras guarda se deshabilitan los campos y botones.

Después de la ficha, `FormularioCompromiso` permite ingresar una descripción y una fecha de compromiso opcional dentro de un borde redondeado de puntos. El icono «+» crea la actividad pendiente con `POST /api/clientes/:clienteId/actividades` y recarga sus actividades; el icono «×» limpia el ingreso. Si falla el guardado, conserva los valores y muestra el error.

La descripción, la fecha y los iconos se distribuyen en una misma fila.

Los mensajes de grupos vacíos ocupan una sola línea con espaciado mínimo. «Agregar cliente», en el encabezado, abre el formulario vacío en el detalle. Al guardar envía `POST /api/clientes`, agrega el registro al maestro y selecciona su ficha; cancelar vuelve al detalle anterior.

El formulario de clientes tiene 6 px de espacio interior para que su scroll no recorte el contorno de foco de campos y botones.

Los campos del formulario se distribuyen en dos columnas: nombre y apellido en la primera fila, email y teléfono en la segunda. Los mensajes y botones ocupan el ancho completo debajo.

Las tareas pendientes tienen iconos para editar y borrar. Editar carga sus valores en el subformulario; guardar usa `PATCH` y cancelar vuelve al ingreso de una tarea nueva. Borrar usa `DELETE`. Las completadas no muestran estas acciones y el repositorio impide actualizarlas o borrarlas directamente; la eliminación del cliente conserva su cascada.

La pantalla ocupa la altura de la ventana sin scroll exterior. El maestro y el área de actividades tienen scroll interno; la ficha y el ingreso de compromisos permanecen visibles. Las actividades se separan en «Compromisos» y «Actividades completadas». Los compromisos se ordenan primero sin fecha, luego vencidos y finalmente con fecha de hoy o futura, ordenados por fecha dentro de cada grupo. Se usa la fecha de Tucumán para determinar vencimientos.

## 28. Experimento con MCP

Agregamos `@modelcontextprotocol/sdk` y `zod`. `mcp.ts` registra 16 herramientas sobre el repositorio `Clientes` y las expone en `/mcp` mediante Streamable HTTP, sin sesiones y con respuestas JSON. Las herramientas cubren CRUD y búsqueda de clientes, y CRUD, listados y finalización de actividades dentro de cada cliente. Los errores de negocio se devuelven con `isError`.

`public/clientes-mcp.html` conserva la interfaz y los componentes de `clientes.html`, pero inicializa MCP y envía `tools/call` por JSON-RPC a `/mcp`. No llama a `/api/clientes`. La búsqueda en vivo sigue filtrando los datos cargados en el navegador. MCP usa HTTP como transporte; no necesita un modelo de IA para realizar estas llamadas.

```sh
npm start
```

- Página REST: `http://localhost:3000/clientes.html`.
- Página MCP: `http://localhost:3000/clientes-mcp.html`.
- Endpoint para clientes MCP compatibles con Streamable HTTP: `http://localhost:3000/mcp`.

Reiniciar el servidor después de incorporar este cambio. Ambas páginas usan la misma base de datos; las modificaciones hechas en una son visibles en la otra al volver a cargar. Para el experimento se mantienen dos HTML independientes; los cambios futuros de interfaz deben aplicarse a ambos.

Comprobaciones realizadas: tipos correctos; conexión e inicialización con el cliente del SDK oficial; listado de 16 herramientas; lectura de clientes y actividades; transformación válida del JSX de la nueva página. En Chrome se comprobó la carga de 11 clientes y la selección de uno con su ficha y actividades. No se realizaron escrituras durante estas comprobaciones.
