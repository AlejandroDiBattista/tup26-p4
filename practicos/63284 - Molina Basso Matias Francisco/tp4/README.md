# MiniCRM

Trabajo práctico 4: clientes y actividades con Node.js, TypeScript, Express, Drizzle y SQLite. En desarrollo utiliza un archivo SQLite local; en producción se conecta a Turso mediante libSQL. La interfaz usa React y JSX embebido en `public/microcrm.html`, con versiones fijas desde CDN.

## Instalación y ejecución

Requiere Node.js 22 o superior y npm. Ejecutar los comandos desde esta carpeta.

```powershell
npm install
Copy-Item .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

En Linux/macOS, reemplazar `Copy-Item .env.example .env` por `cp .env.example .env`.

Abrir **http://localhost:3000**. La base `local.db` se crea con las migraciones. `npm run db:seed` agrega 10 clientes ficticios y 40 actividades (4 por cliente): 20 pendientes y 20 completadas; 20 no tienen fecha de compromiso. La interfaz necesita conexión a Internet para cargar React, ReactDOM y Babel desde CDN. No requiere un bundler.

La carga es opcional y se puede repetir: identifica cada cliente demo por email y sus actividades por cliente + descripción. Inserta únicamente los faltantes, dentro de un lote transaccional, sin sobrescribir los datos ni reiniciar actividades completadas. Si cambiás el email o la descripción usados como identidad de un ejemplo, una nueva carga recreará el ejemplo original. Los datos están en `src/db/seed-data.ts`.

## Modelo 1:n

Cada cliente tiene una lista de actividades; cada actividad pertenece a un único cliente mediante `clienteId`. Drizzle declara ambas relaciones y `GET /api/clientes/:clienteId` devuelve la ficha con su lista `actividades`.

- Cliente: `id`, `nombre`, `apellido` e `email` obligatorios; `domicilio`, `localidad` y `telefono` opcionales.
- Actividad: `id`, `descripcion`, `fechaCompromiso` y `fechaFinalizacion`. Ambas fechas pueden ser `null`.
- `fechaCompromiso` usa `AAAA-MM-DD`; `null` significa **sin fecha**.
- `fechaFinalizacion` usa fecha y hora ISO en UTC. El servidor la registra al completar; mientras sea `null`, la actividad está pendiente. No se acepta en el alta o edición normal.
- La carga ficticia incluye fechas históricas de finalización para representar actividades ya completadas. Eliminar un cliente elimina sus actividades.

La migración desde el modelo anterior conserva identificadores, actividades, email, teléfono y dirección (ahora domicilio). Separa el nombre completo en el primer espacio; conviene revisar nombres compuestos y completar apellidos que antes faltaban. Las actividades antes completadas no tenían fecha histórica: se marca el momento de migración como finalización. Los campos anteriores `empresa` y `notas` dejan de formar parte del modelo.

## Uso

La página principal es `http://localhost:3000/microcrm.html` (también accesible desde `/`). Todo su JSX y CSS está embebido en ese archivo. Usa React 18.3.1, ReactDOM 18.3.1 y Babel Standalone 7.26.4 por CDN; el preset `microcrm` fija explícitamente `runtime: "classic"` para compilar JSX usando el objeto global `React`.

La interfaz separa `ClientesService` y `ActividadesService` del renderizado. Los componentes `Layout`, `Form`, `Field`, `Button`, `Icon` y `EmptyState` se reutilizan en `ClientList`, `ClientCard`, `ClientForm`, `ClientDetail`, `ActivityList`, `ActivityItem` y `ActivityForm`. No usa componentes externos ni frameworks CSS. La página anterior `/MiniCRM.html` sigue disponible por compatibilidad.

- Buscar en vivo por nombre, apellido, email, teléfono, domicilio, localidad o identificador. Ignora mayúsculas y acentos; permite combinar palabras de distintos campos (por ejemplo `garcia yerba`). Los símbolos `%` y `_` se buscan literalmente. El filtrado se hace en el servicio sobre la agenda, adecuado para este MiniCRM sin paginación.
- Seleccionar un cliente para consultar su ficha y actividades.
- Agregar o editar clientes dentro del panel de detalle.
- **Agregar** y **Editar** comparten un formulario de tres filas: nombre/apellido, email/teléfono y domicilio/localidad, con **Guardar** y **Cancelar** debajo. Guardar usa la API y recarga el maestro y la ficha; Cancelar descarta los cambios sin enviarlos.
- Agregar y editar actividades pendientes mediante el subformulario siempre visible debajo de la ficha, con borde punteado redondeado y controles en una línea. La descripción es obligatoria; la fecha de compromiso es opcional. Los iconos de guardar y cancelar limpian el formulario y actualizan el listado. Los pendientes incluyen iconos de editar y borrar; todos los campos y botones tienen nombres accesibles.
- Completar una actividad registra su fecha de ejecución en `fechaFinalizacion` y la vuelve de solo lectura. Las pendientes pueden eliminarse individualmente; las completadas no pueden editarse ni borrarse individualmente.
- Las listas muestran **Compromisos** y luego **Actividades completadas**. Los compromisos sin fecha aparecen primero, seguidos de vencidos y de fechas actuales/futuras en orden ascendente. Cada fila tiene un check para completar y muestra debajo de la descripción la fecha de compromiso (o «Sin fecha de compromiso»); las completadas muestran únicamente la fecha de finalización. Los grupos vacíos usan un mensaje compacto.
- Eliminar un cliente elimina también todas sus actividades, previa confirmación.

La página ocupa la altura de la ventana: el listado maestro y las actividades tienen desplazamiento interno independiente, manteniendo visibles la búsqueda y la ficha. El identificador aparece como `#123` arriba a la derecha del detalle. En pantallas pequeñas, la lista y el detalle se alternan mediante **Volver a clientes**. Los formularios y las fichas excepcionalmente largas tienen su propio desplazamiento interno para no desplazar la página ni ocultar las actividades.

## Servicio y normalización

`Clientes` expone métodos estáticos para crear, listar/buscar, obtener, actualizar y eliminar clientes, y para agregar, listar, obtener, modificar, completar y eliminar actividades. Los tipos `Cliente`, `NuevoCliente`, `Actividad` y `NuevaActividad` se infieren de Drizzle con `$inferSelect` y `$inferInsert`. Se valida `unknown` al ingresar al servicio y se devuelve información tipada.

Al crear o actualizar (también al sembrar), los nombres y apellidos se normalizan a Unicode NFC, sin espacios sobrantes y con inicial de cada palabra en mayúscula; el email se guarda sin espacios exteriores y en minúsculas. Los teléfonos pierden espacios, paréntesis, puntos y guiones; conservan un `+` inicial y los ceros, sin inventar un código de país. Admiten entre 6 y 15 dígitos. Los campos opcionales vacíos se guardan como `null`.

El servicio devuelve `completada` y `vencida` calculadas, sin persistirlas: tiene ejecución si `fechaFinalizacion` no es nula; está vencida si sigue pendiente y su compromiso es anterior a hoy en `America/Argentina/Buenos_Aires`. Hoy, una fecha futura o sin fecha no están vencidos. La interfaz utiliza el estado recibido de la API. Los bloqueos de edición y borrado se comprueban también dentro del `UPDATE`/`DELETE`, protegiendo frente a una finalización concurrente.

## Producción con Turso

Crear una base en Turso y obtener su URL `libsql://…` y un token de acceso con permisos de escritura. Configurar estas variables en el servicio de alojamiento o en un `.env` privado:

```dotenv
NODE_ENV=production
PORT=3000
TURSO_DATABASE_URL=libsql://tu-base-tu-organizacion.turso.io
TURSO_AUTH_TOKEN=tu-token
```

```powershell
npm ci
npm run build
npm run db:migrate
npm start
```

En producción se exige la configuración de Turso y se ignora `DATABASE_URL`; no hay fallback silencioso a una base local. Las migraciones deben ejecutarse una vez durante cada despliegue, antes de iniciar el servidor, con las mismas variables. El paso de migración utiliza `tsx`, por lo que requiere instalar también las dependencias de desarrollo. Publicar `dist/`, `public/`, `drizzle/`, `package.json` y `package-lock.json`; ejecutar desde la raíz del proyecto.

Las credenciales se usan exclusivamente en el servidor. `.env` y las bases locales están excluidas de Git. El proyecto académico no incluye autenticación: para usarlo con datos reales, proteger el acceso a la aplicación y a la API en el alojamiento.

Referencia del adaptador compartido para SQLite local y Turso: [documentación de Drizzle](https://orm.drizzle.team/docs/tutorials/drizzle-with-turso).

## Pruebas

```powershell
npm run check
npm test
npm run build
```

Las pruebas de integración usan el runner de Node, un servidor HTTP en un puerto libre y una base SQLite **en memoria**, aislada de `local.db` y Turso. Aplican las migraciones reales y verifican CRUD, búsqueda por todos los campos, validación, pertenencia de actividades, edición, bloqueo de completadas y eliminación en cascada. No requieren credenciales.

`npm audit --omit=dev` no reporta vulnerabilidades en las dependencias de producción. La herramienta de desarrollo `drizzle-kit` arrastra avisos moderados por una versión transitiva de esbuild; el proyecto no usa su servidor de desarrollo. Evitar `npm audit fix --force`, que propone degradar Drizzle Kit a una versión incompatible.

Prueba manual de interfaz:

1. Crear dos clientes, buscar por teléfono y seleccionar uno.
2. Editar su ficha; crear, editar y completar una actividad. Confirmar que ya no ofrece edición.
3. Recargar la página y comprobar persistencia.
4. Eliminar el cliente y comprobar que desaparece de la búsqueda.
5. Usar una ventana angosta y navegar con teclado; comprobar el desplazamiento dentro de los paneles.

## Organización

```text
src/
  config.ts                 Conexión según entorno
  db/schema.ts              Tablas Drizzle
  db/index.ts               Cliente libSQL y ORM
  db/migrate.ts             Aplicación de migraciones
  db/seed.ts                Comando de carga ficticia
  db/seed-demo.ts           Siembra transaccional sin duplicados
  db/seed-data.ts           Diez clientes y actividades de ejemplo
  services/clientes.ts      Clase Clientes, validación y reglas de negocio
  services/validacion.ts    Validación y normalización al guardar
  services/estado-actividad.ts Estados y fecha de hoy en Argentina
  controllers/clientes.ts   Entrada y respuesta HTTP
  routes/clientes.ts        Rutas REST
  app.ts                    Express, estáticos y errores
  server.ts                 Arranque y cierre
drizzle/                    Migraciones versionadas
public/microcrm.html          React, JSX y CSS
tests/api.test.ts            Pruebas de integración
```

Para modificar el modelo, editar `src/db/schema.ts`, ejecutar `npm run db:generate` y luego `npm run db:migrate`. Versionar los archivos generados de `drizzle/`. No editar migraciones ya aplicadas.

## API REST

Todos los cuerpos son JSON. Los errores devuelven `{ "error": "mensaje" }`, con detalles adicionales para validación.

- `GET /api/clientes?q=texto`: listar y buscar clientes.
- `GET /api/clientes/:clienteId`: obtener ficha con actividades.
- `POST /api/clientes`: crear; devuelve `201`.
- `PUT /api/clientes/:clienteId`: reemplazar los campos editables del cliente.
- `DELETE /api/clientes/:clienteId`: eliminar cliente y actividades; devuelve `204`.
- `POST /api/clientes/:clienteId/actividades`: agregar una actividad; devuelve `201`.
- `GET /api/clientes/:clienteId/actividades`: listar actividades con su estado.
- `GET /api/clientes/:clienteId/actividades/:actividadId`: obtener una actividad.
- `PUT /api/clientes/:clienteId/actividades/:actividadId`: editar una pendiente.
- `DELETE /api/clientes/:clienteId/actividades/:actividadId`: eliminar una pendiente; devuelve `204` o `409` si está completada.
- `PATCH /api/clientes/:clienteId/actividades/:actividadId/completar`: completar, sin cuerpo.

Cliente: `nombre`, `apellido` y `email` obligatorios; `domicilio`, `localidad` y `telefono` opcionales (por defecto `null`). Actividad: `descripcion` obligatoria y `fechaCompromiso` (`AAAA-MM-DD` o `null`) opcional. `fechaFinalizacion` es de solo lectura y se registra al completar. Una actualización de actividad completada devuelve `409`; datos inválidos `400`; recursos inexistentes `404`.
