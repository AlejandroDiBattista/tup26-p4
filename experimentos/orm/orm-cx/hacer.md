# MiniCRM para una clase de programación

Crea un proyecto didáctico con Node.js, TypeScript estricto y módulos ESM, Drizzle ORM, SQLite local y conexión configurable a Turso mediante `@libsql/client`. Prioriza ejemplos breves, claros y enfocados; evita funcionalidades y abstracciones adicionales. Documenta el resultado en `instrucciones.md`.

## Configuración

Usa `file:clase.db` por defecto, sin requerir cuenta, token ni conexión a Internet después de instalar las dependencias. Permite configurar `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` mediante `.env`; entrega `.env.example` y excluye secretos, bases locales y dependencias de Git. Usa `tsx`, Drizzle Kit y tipos inferidos del esquema. Scripts: `start`, `check`, `db:push` y `db:seed`. Conserva datos y tablas ajenas al CRM.

## Modelo

- **clientes:** `id` autoincremental; `nombre`, `apellido` y `email` obligatorios; `email` único; `telefono` opcional como texto.
- **actividades:** `id` autoincremental; `clienteId` obligatorio; `descripcion` obligatoria; `fecha` y `fechaCompromiso` opcionales como texto `AAAA-MM-DD`; `completadaEn` opcional como `Date` en TypeScript y timestamp en milisegundos en SQLite.
- **Composición:** un cliente tiene cero o muchas actividades; cada actividad requiere un cliente existente. Eliminar el cliente elimina sus actividades en cascada.
- `completadaEn = null` significa pendiente. Completar registra la fecha y hora de la operación. No agregues un booleano de estado.

Alinea las definiciones de campos para facilitar su lectura.

## Repositorios

Clase estática `Clientes` en `repositorios/clientes.ts`. Ofrece el CRUD de clientes y también el CRUD de actividades como parte del cliente. Los métodos de actividad reciben `clienteId`; obtener o actualizar un registro inexistente devuelve `undefined`, eliminar devuelve un booleano y crear o actualizar devuelve el registro. Propaga los errores.

**Clientes:** `listar()`, `buscarPorEmail(email)` y `buscar(texto)`. La búsqueda flexible usa `like` con `%texto%` y `or`, con una condición explícita por campo, incluido el id. Texto vacío lista todos; sin coincidencias devuelve `[]`. Mantén el comportamiento de comodines y mayúsculas de SQLite; evita SQL elaborado.

**Actividades dentro de `Clientes`:** `listarActividades(clienteId)`, `listarActividadesPendientes(clienteId)`, `listarActividadesVencidas(clienteId)`, `listarActividadesSinCompromiso(clienteId)`, `obtenerActividad(clienteId, actividadId)`, `crearActividad(clienteId, datos)`, `actualizarActividad(clienteId, actividadId, datos)`, `completarActividad(clienteId, actividadId)` y `eliminarActividad(clienteId, actividadId)`. Las operaciones verifican que la actividad pertenezca al cliente. Vencidas: pendientes con compromiso anterior a hoy en `America/Argentina/Tucuman`; el compromiso de hoy no está vencido. Sin compromiso: pendientes con compromiso `null`.

## Normalización de clientes

Aplica al crear y actualizar, con auxiliares sencillos:

- Rechaza nombre y apellido nulos, ausentes al crear o vacíos. Recorta extremos, colapsa espacios y usa iniciales mayúsculas, respetando acentos, guiones y apóstrofos; partículas `de`, `del`, `la`, `las`, `los`, `y` en minúscula.
- Email obligatorio: recorta extremos y convierte a minúsculas, también al buscar por email. Conserva espacios internos, puntos y etiquetas; la unicidad se aplica al valor normalizado.
- Teléfono vacío o nulo → `null`. Usa `libphonenumber-js` con país `AR` y formato internacional con espacios. Exige código de área y rechaza números inválidos, extranjeros o con extensiones. Distingue fijos y móviles sin inventar el prefijo `9`: `3815550101` → `+54 381 555 0101`; `0381 15 5550101` → `+54 9 381 555 0101`.

## Ejemplos y entrega

- `seed.ts`: 10 clientes ficticios, teléfonos opcionales y 3 actividades por cliente: una completada con fecha, una pendiente con compromiso y una pendiente sin fechas. Carga transaccional; omite emails existentes y sus actividades sin duplicar ni modificar datos.
- `index.ts`: mediante repositorios, reutiliza o crea a Ana Pérez (`ana@example.com`), agrega una actividad pendiente, la muestra, la completa y lista sus actividades. Cada ejecución agrega una actividad.
- API REST con Express: los manejadores están en `manejadores/clientes.ts` y las rutas de clientes y actividades en `routers/clientes.ts`. Las actividades se exponen como recursos anidados en `/api/clientes/:clienteId/actividades`; no existe un router independiente de actividades.
- `estructura.html`: diagrama estático autocontenido, legible en escritorio y móvil, sin servidor ni recursos externos. Muestra entidades, campos, tipos, reglas, cardinalidad, composición, cascada y significado de fechas y estados.
- Deja el proyecto instalado y ejecutable localmente, con tablas creadas, semilla cargada y ejemplo ejecutado. Verifica tipos, CRUD, búsquedas, normalizaciones, unicidad, filtros por cliente y eliminación en cascada; usa SQLite temporal para pruebas que alteren datos. Registra resultados reales en `instrucciones.md`.
