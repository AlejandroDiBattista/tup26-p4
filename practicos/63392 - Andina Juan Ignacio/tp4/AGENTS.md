# AGENTS.md — TP4 MiniCRM (legajo 63392)

Trabajo práctico evaluado de Programación IV. **`enunciado.md` es la única fuente
de requisitos**; `minicrm.jpg` es la referencia visual y `PLAN.md` el plan
aprobado. Si algo de este archivo contradice `enunciado.md`, gana el enunciado.

No renombrar ni mover la carpeta: el docente la lee como
`practicos/<legajo> - <Nombre>/tp4/`.

## Regla de oro

Se implementa **solo** lo que pide el enunciado. **No se agregan tecnologías,
reglas de negocio, validaciones ni contratos** que el enunciado no mencione. Si
aparece una idea nueva, primero se actualiza `PLAN.md` y se espera aprobación;
recién después se toca Jira o el código.

Lo que el enunciado no pide, no genera ticket.

## Requisitos (transcritos del enunciado)

- MiniCRM para gestionar **clientes y sus actividades**; proyecto **modular,
  minimalista y legible**.
- Base de datos **SQLite mediante Drizzle**.
- **Módulo de servicio** con la clase `Clientes` y **métodos estáticos** para
  CRUD, incluida **búsqueda flexible por cualquier campo**.
- **API REST con Express**, separando **controladores y routers**, con las
  **reglas de negocio en el servicio**.
- **`public/MiniCRM.html`** con **React, JSX embebido y CSS**, bibliotecas por
  **CDN de versiones fijas**; toda la funcionalidad **usando la API REST**.
- **Maestro y detalle**, con **búsqueda en vivo por cualquier campo**; el cliente
  seleccionado muestra su **ficha** y sus **actividades de solo lectura**.
- **Sin desplazamiento de página**; **maestro** y **actividades** con
  **desplazamiento vertical interno**.
- Se debe poder **agregar clientes y actividades, completar actividades y
  eliminar clientes**.
- **Las actividades completadas no se pueden editar ni borrar individualmente**.
- **Alta y edición de clientes en el detalle**; **alta y edición de actividades
  en un subformulario dentro del detalle** del cliente.

## Stack

Exactamente el del enunciado: Node.js + TypeScript, Express, Drizzle ORM, SQLite
y React + CSS + JSX embebido en `public/MiniCRM.html` con CDN de versiones fijas.

Ninguna otra herramienta se declara como requisito. Las decisiones de
implementación (driver de SQLite, cómo se compila el JSX, scripts npm, ruta de la
base, puerto) no son requisitos y no generan tickets.

## Datos (según `minicrm.jpg`)

El enunciado no enumera campos; estos salen de la referencia visual.

- **Cliente:** nombre, email, teléfono, dirección, ciudad.
- **Actividad:** descripción, fecha, completada y fecha de finalización.

## Servicio `Clientes`

Un único módulo `src/services/clientes.ts` con métodos **estáticos**:

```ts
class Clientes {
  static listar(busqueda?: string)   // incluye búsqueda por cualquier campo
  static obtener(id: number)
  static crear(datos)
  static actualizar(id: number, datos)
  static eliminar(id: number)
  static listarActividades(clienteId: number)
  static crearActividad(clienteId: number, datos)
  static actualizarActividad(id: number, datos)
  static completarActividad(id: number)
  static eliminarActividad(id: number)
}
```

Las reglas de negocio (búsqueda flexible y que una actividad completada no se
edite ni se borre) viven acá, no en controladores ni rutas.

## Módulos

Cuatro módulos, en este orden: datos/servicio → API → UI → verificación.

### M1 · Base de datos y servicio `Clientes`

Tablas con Drizzle (`clientes`, `actividades`), conexión SQLite y la clase
`Clientes` con todos sus métodos estáticos.

Actividades:
- [ ] Inicializar el proyecto **en el directorio actual** con **npm**
      (`npm init`, `tsconfig.json`, estructura de carpetas y dependencias).
- [ ] Agregar `.gitignore` local para excluir dependencias, builds y la base
      SQLite (`node_modules/`, `dist/`, `*.db`, `*.db-shm`, `*.db-wal`, `.env`).
- [ ] Tablas y conexión SQLite con Drizzle.
- [ ] Clase `Clientes` con métodos estáticos de clientes.
- [ ] Búsqueda flexible por cualquier campo.
- [ ] Métodos de actividades, incluida completar.
- [ ] Las completadas no se editan ni se borran.

### M2 · API REST con Express

Controladores y routers separados; reglas de negocio en el servicio.

Actividades:
- [ ] Rutas de clientes (listar/buscar, obtener, alta, edición, baja).
- [ ] Rutas de actividades (listar, alta, edición, completar, baja).
- [ ] Controladores que solo llaman al servicio.
- [ ] Servir `public/` y montar la API.

### M3 · Interfaz `public/MiniCRM.html`

React, JSX embebido y CSS por CDN con versiones fijas; toda la interacción por la
API REST.

Actividades:
- [ ] Layout maestro-detalle sin scroll de página, con scroll interno en maestro y
      actividades.
- [ ] Maestro con buscador y búsqueda en vivo por cualquier campo.
- [ ] Ficha del cliente con alta y edición en el detalle.
- [ ] Subformulario de actividades dentro del detalle.
- [ ] Listas de pendientes y completadas (completadas de solo lectura).
- [ ] Agregar, editar, completar y eliminar según corresponda.

### M4 · Verificación y entrega

Actividades:
- [ ] Compilar y levantar el servidor.
- [ ] Probar alta/edición/baja de clientes y búsqueda por distintos campos.
- [ ] Probar alta/edición/completar de actividades y la inmutabilidad de las
      completadas.
- [ ] Revisar scroll interno y layout sin scroll de página.
- [ ] Correr el checker del docente.

## Estructura

```text
tp4/
  package.json
  tsconfig.json
  .gitignore                # node_modules, dist, *.db, *.db-shm, *.db-wal, .env
  src/
    server.ts                 # Express: API y estáticos
    db/
      schema.ts               # tablas Drizzle
      index.ts                # conexión SQLite
    services/
      clientes.ts             # clase Clientes (métodos estáticos)
    controllers/              # request/response, sin reglas de negocio
    routes/                   # routers Express
  public/
    MiniCRM.html              # React + JSX + CSS por CDN
```

La estructura concreta puede ajustarse; lo que no cambia es la separación
servicio / controladores / rutas y el único HTML de la UI.

## Comandos

El proyecto usa **npm** y se inicializa **en el directorio actual** (`tp4/`), sin
crear una subcarpeta:

```bash
npm init -y        # crea package.json acá
npm install
npm run build      # compila TypeScript
npm run start      # levanta el servidor
```

Los scripts de desarrollo y de migraciones son decisiones locales; no son
requisitos del TP.

## Trabajo con Jira

- **Sitio:** `https://juanandina01.atlassian.net`
- **Cloud ID:** `f0bcc9de-420d-40a7-9866-3ab97a7ada15`
- **Proyecto:** `Programacion 4` (clave **`SCRUM`**, team-managed).
- **Epic:** `tp4` (**SCRUM-5**).
- **Jerarquía:** Epic → los 4 tickets de módulo. **Sin subtareas**: las
  actividades van como checklist en la descripción del ticket.
- **Labels:** `tp4` y `legajo-63392`.
- **Estados existentes:** `Tareas por hacer`, `En curso`, `In Revew`,
  `Finalizada`, `Blocked`, `Cancelado`. No se inventan estados ni flujo nuevo.

Reglas:

1. Un ticket por módulo (`M1`…`M4`).
2. Al empezar un módulo, su ticket pasa a `En curso`; al terminar, a
   `Finalizada`.
3. Cada commit referencia la clave: `SCRUM-XX M1: ...`.
4. Un requisito nuevo no se implementa ni se ticketea sin actualizar `PLAN.md`.

Tickets de módulo:

| Módulo | Ticket |
| --- | --- |
| M1 · Base de datos y servicio `Clientes` | `SCRUM-54` |
| M2 · API REST con Express | `SCRUM-55` |
| M3 · Interfaz `public/MiniCRM.html` | `SCRUM-56` |
| M4 · Verificación y entrega | `SCRUM-57` |

Los tickets `SCRUM-6` a `SCRUM-13` y sus 40 subtareas corresponden al plan
anterior (con PRAGMA, cascada, códigos HTTP y tooling agregado) y quedaron
**cancelados**. No se usan como referencia.

## Verificación

Control de presencia del docente (desde la raíz del repo):

```bash
node sistema/tools/probar-tp4.js 63392
```

Exige `public/MiniCRM.html` con contenido y al menos un archivo `.ts` de servidor
en el mismo proyecto. No cuentan `*.config.ts`, `*.d.ts`, `*.test.ts`/`*.spec.ts`
ni archivos dentro de `public/`; se ignoran `node_modules/`, `dist/`, `build/`,
`coverage/`, `vendor/`, `test/`, `tests/`, `__tests__/`. Límites: 2 MB por
archivo, 8 niveles de subcarpetas, 5000 archivos, sin symlinks.

Ese control **no ejecuta ni compila** la entrega. La validación real es manual:
levantar el servidor y probar clientes, búsqueda y actividades.

## Reglas del repo

- Trabajar solo dentro de esta carpeta; los commits incluyen únicamente archivos
  de `tp4/` (evitar `git add .`).
- `node_modules/`, `dist/`, builds y `.env` ya están ignorados en la raíz, pero
  **la base SQLite no**: el `.gitignore` local de `tp4/` cubre `*.db`,
  `*.db-shm` y `*.db-wal` (y repite las reglas de dependencias/builds por las
  dudas). Ese archivo se crea como primera actividad de M1.
- Las rutas tienen espacios: citarlas siempre en la terminal.
- Reglas generales del repositorio: `../../../AGENTS.md`.
