# Plan de Implementación: TP4 — MiniCRM (Auditado)

Desarrollo de un MiniCRM modular, minimalista y legible en [tp4](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4) según [enunciado.md](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/enunciado.md) y la referencia visual [minicrm.jpg](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/minicrm.jpg).

## Estructura del proyecto (`tp4/`)

Se adopta una estructura plana dentro de `src/` para evitar subdirectorios de un solo archivo (sin sobreingeniería) manteniendo una separación clara de responsabilidades:

```text
tp4/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── implementation_plan.md    # Seguimiento de tareas del proyecto
├── src/
│   ├── db.ts                  # Esquema Drizzle, conexión SQLite, PRAGMA foreign_keys e init/seed
│   ├── clientes.service.ts    # Clase Clientes con métodos estáticos (CRUD + búsqueda + reglas de negocio)
│   ├── clientes.controller.ts # Controladores HTTP (manejo de req/res y códigos de estado)
│   ├── clientes.routes.ts     # Router de Express con los endpoints REST
│   └── server.ts              # Configuración de Express, archivos estáticos y arranque
└── public/
    └── MiniCRM.html           # Interfaz web con React 18, Babel y CSS desde CDN con versiones fijas
```

---

## Fases y Tareas

### Paso 1. Inicialización del Proyecto y Dependencias (Completado)
- `package.json` en `tp4/` (`type: "module"`).
- Paquetes instalados: `express`, `drizzle-orm`, `@libsql/client`, `typescript`, `tsx`, `@types/node`, `@types/express`, `drizzle-kit`.
- Configuración de `tsconfig.json`, `drizzle.config.ts` y `.gitignore`.

### Paso 2. Capa de Datos (SQLite + Drizzle) (Completado)
- Crear [`src/db.ts`](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/src/db.ts) concentrando esquema y conexión para mantener el código simple y legible:
  - **Tabla `clientes`**:
    - `id`: `integer('id').primaryKey({ autoIncrement: true })`
    - `nombre`: `text('nombre').notNull()`
    - `email`: `text('email').notNull().default('')`
    - `telefono`: `text('telefono').notNull().default('')`
    - `direccion`: `text('direccion').notNull().default('')`
  - **Tabla `actividades`**:
    - `id`: `integer('id').primaryKey({ autoIncrement: true })`
    - `clienteId`: `integer('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' })`
    - `descripcion`: `text('descripcion').notNull()`
    - `fecha`: `text('fecha')` (opcional `YYYY-MM-DD`, `null` cuando es *"Sin fecha"*)
    - `completada`: `integer('completada', { mode: 'boolean' }).notNull().default(false)`
    - `fechaCompletada`: `text('fecha_completada')` (`YYYY-MM-DD` cuando se completa)
  - **Inicialización automática (`initDb`)**:
    - Ejecutar `PRAGMA foreign_keys = ON;` al conectar (imprescindible en SQLite para que funcione el borrado en cascada `ON DELETE CASCADE` al eliminar un cliente).
    - Ejecutar `CREATE TABLE IF NOT EXISTS` para ambas tablas al iniciar el servidor (así el proyecto funciona de inmediato con `npm start` / `npm run dev` sin depender de pasos manuales externos).
    - Cargar datos semilla iniciales (los clientes y actividades de `minicrm.jpg`) si la tabla `clientes` está vacía.

### Paso 3. Capa de Servicio (`Clase Clientes`) (Completado)
- Implementar en [`src/clientes.service.ts`](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/src/clientes.service.ts) la clase `Clientes` con **métodos estáticos** y todas las reglas de negocio:
  - `listar(buscar?: string)`:
    - Si no hay término de búsqueda, devuelve todos los clientes ordenados por nombre.
    - Si hay búsqueda, filtra de forma flexible e insensible a mayúsculas/acentos por cualquier campo del cliente (`id`, `nombre`, `email`, `telefono`, `direccion`) o de sus actividades (`descripcion`, `fecha`).
  - `obtenerPorId(id: number)`: devuelve el cliente junto con su arreglo `actividades` (o `null` si no existe).
  - `crear(datos)`: valida que `nombre` no esté vacío y crea el cliente.
  - `actualizar(id: number, datos)`: valida `nombre` y actualiza los datos del cliente.
  - `eliminar(id: number)`: elimina al cliente (y sus actividades asociadas).
  - `agregarActividad(clienteId: number, datos)`: verifica que el cliente exista, valida `descripcion` obligatoria y crea la actividad pendiente (`completada: false`).
  - `actualizarActividad(clienteId: number, actividadId: number, datos)`:
    - Verifica que la actividad exista y pertenezca a `clienteId`.
    - **Regla de negocio**: si `actividad.completada === true`, lanza error de negocio (no se permite editar actividades completadas).
  - `completarActividad(clienteId: number, actividadId: number)`:
    - Verifica que la actividad exista y pertenezca a `clienteId`.
    - Marca `completada = true` y asigna `fechaCompletada` con la fecha actual (`YYYY-MM-DD`).
  - `eliminarActividad(clienteId: number, actividadId: number)`:
    - Verifica que la actividad exista y pertenezca a `clienteId`.
    - **Regla de negocio**: si `actividad.completada === true`, lanza error de negocio (no se permite borrar individualmente actividades completadas).

### Paso 4. API REST con Express (Controladores y Routers) (Completado)
- Crear [`src/clientes.controller.ts`](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/src/clientes.controller.ts) traduciendo entre HTTP (`req`, `res`) y los métodos estáticos de `Clientes`, respondiendo con códigos claros (`200`, `201`, `204`, `400`, `404`).
- Crear [`src/clientes.routes.ts`](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/src/clientes.routes.ts) con las rutas REST:
  - `GET /api/clientes?q=...`
  - `GET /api/clientes/:id`
  - `POST /api/clientes`
  - `PUT /api/clientes/:id`
  - `DELETE /api/clientes/:id`
  - `POST /api/clientes/:id/actividades`
  - `PUT /api/clientes/:id/actividades/:actId`
  - `PATCH /api/clientes/:id/actividades/:actId/completar`
  - `DELETE /api/clientes/:id/actividades/:actId`
- Crear [`src/server.ts`](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/src/server.ts) que inicializa la base de datos (`await initDb()`), sirve `public/` como estático, redirige `/` a `/MiniCRM.html` y monta `/api/clientes`.

### Paso 5. Interfaz Web (`public/MiniCRM.html`) (Completado)
- Construir [`public/MiniCRM.html`](file:///c:/Users/lopez/OneDrive/Documentos/A1%20Tecnicatura/Programacion%204/tup26-p4/practicos/63448%20-%20Lopez%20Avila%20Eduardo%20Benjamin/tp4/public/MiniCRM.html) cargando desde CDN con **versiones fijas** (`react@18.3.1`, `react-dom@18.3.1`, `@babel/standalone@7.26.2`).
- **Comportamiento de Layout y Scroll**:
  - `height: 100vh` y `overflow: hidden` a nivel página para que nunca haya scroll de ventana completa.
  - **Maestro (izquierda)**: cabecera fija (`Clientes`, botón `+ Agregar` y buscador en vivo) + lista de clientes con `overflow-y: auto`.
  - **Detalle (derecha)**:
    - Si se está creando o editando un cliente, muestra el **formulario del cliente en el detalle** (`nombre`, `email`, `telefono`, `direccion`, botones `Guardar` y `Cancelar`).
    - Si hay un cliente seleccionado en modo lectura, muestra su **ficha** (nombre, `#id`, `Editar`, `Eliminar`, correo, teléfono y dirección), el **subformulario de actividades** (alta o edición de actividad pendiente) y el área de actividades con desplazamiento vertical interno (`overflow-y: auto`), dividida en **Compromisos** (con checkbox para completar, indicador de `"Vencido"` si `fecha < hoy`, y botones de editar/eliminar) y **Actividades completadas** (solo lectura, sin botones de edición ni borrado).

### Paso 6. Verificación Integral
- Probar arranque limpio con `npm start` y verificar que la base y semilla se creen solas.
- Probar todas las operaciones CRUD y reglas de negocio desde la API REST y la interfaz `public/MiniCRM.html`.
