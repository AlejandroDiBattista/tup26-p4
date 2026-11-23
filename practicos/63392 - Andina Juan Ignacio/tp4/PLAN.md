# Plan de desarrollo — TP4 MiniCRM (legajo 63392)

**Estado: aprobado.** El setup inicial (npm en el directorio actual + `.gitignore`
local) queda como primeras actividades de M1 (`SCRUM-54`).

## 1. Regla de oro

`enunciado.md` es la única fuente de requisitos técnicos. `minicrm.jpg` aporta
solo la referencia visual. Si algo no está en el enunciado, **no se agrega como
requisito ni se crea un ticket para eso**.

Este plan reemplaza al anterior, que agregaba tecnologías y reglas inventadas.

## 2. Requisitos (transcritos del enunciado)

- MiniCRM para gestionar **clientes y sus actividades**; proyecto **modular,
  minimalista y legible**.
- Base de datos **SQLite mediante Drizzle**.
- **Módulo de servicio** con la clase `Clientes` y **métodos estáticos** para
  CRUD, incluida **búsqueda flexible por cualquier campo**.
- **API REST con Express**, separando **controladores y routers**, con las
  **reglas de negocio en el servicio**.
- **`public/MiniCRM.html`** usando **React, JSX embebido y CSS**, con bibliotecas
  por **CDN de versiones fijas**. Toda la funcionalidad se implementa **usando la
  API REST**.
- Página organizada como **maestro y detalle**, con **búsqueda en vivo por
  cualquier campo**. Seleccionar un cliente muestra su **ficha** y sus
  **actividades de solo lectura**.
- Layout **sin desplazamiento de página**; el **maestro** y las **actividades**
  tienen **desplazamiento vertical interno**.
- Se debe poder **agregar clientes y actividades, completar actividades y
  eliminar clientes**.
- **Las actividades completadas no se pueden editar ni borrar individualmente**.
- **Alta y edición de clientes en el detalle**. **Alta y edición de actividades
  en un subformulario dentro del detalle** del cliente.

## 3. Stack permitido

Exactamente el del enunciado:

- Node.js + TypeScript
- Express
- Drizzle ORM
- SQLite
- React + CSS + JSX embebido en `public/MiniCRM.html`, con CDN de versiones fijas

Nada más se declara como requisito.

Decisiones del usuario (no son requisitos del enunciado):

- Gestor de paquetes: **npm**.
- El proyecto se crea **en el directorio actual** (`tp4/`), sin subcarpeta nueva.
- **`.gitignore` local** en `tp4/` para no subir dependencias, builds, `.env` ni
  la base SQLite al repositorio principal.

## 4. Lo que se quita (corrección del plan y de los tickets actuales)

| Elemento agregado | Por qué sale |
| --- | --- |
| `PRAGMA foreign_keys` | Tecnología agregada; el enunciado no lo pide. |
| FK con `ON DELETE CASCADE` | El enunciado dice "eliminar clientes", no prescribe mecanismo. Al borrar un cliente se borran sus actividades, sin fijar cómo. |
| Errores tipados `validacion`/`no_encontrado`/`conflicto` y códigos `400/404/409` | Contrato inventado; el enunciado no define códigos ni taxonomía. |
| `better-sqlite3`, `drizzle-kit`, `tsx`, `@types/*`, Babel Standalone como requisitos | Son decisiones de implementación, no requisitos del TP. |
| Validaciones no pedidas (nombre obligatorio, trim, etc.) | No están en el enunciado. |
| Puerto 3000 y ruta `data/minicrm.db` | Decisiones locales de implementación; no generan tickets. El `.gitignore` local sí es una actividad de M1 (para no subir la base ni dependencias). |
| Textos en español / locale `es-AR` | No es requisito. Se usará español por coherencia con la referencia visual, pero no se ticketea. |
| 8 tickets + 40 subtareas | Sobredimensionado. Se reemplaza por 4 tickets simples. |

## 5. Alcance funcional (lo que sí se implementa)

- **Clientes:** alta, edición, baja y búsqueda en vivo por cualquier campo.
- **Actividades:** alta, edición y completar. Las completadas no se editan ni se
  borran individualmente.
- **UI:** maestro-detalle sin scroll de página, con scroll interno en la lista de
  clientes y en las actividades; búsqueda en vivo; ficha del cliente; alta y
  edición de clientes en el detalle; actividades en subformulario del detalle y
  listadas en modo lectura.
- **Toda** la interacción de la UI contra la API REST.

## 6. Datos (según `minicrm.jpg`)

El enunciado no enumera campos; estos salen de la referencia visual y **no son
requisitos técnicos**:

- **Cliente:** nombre, email, teléfono, dirección, ciudad.
- **Actividad:** descripción, fecha, completada y fecha de finalización.

## 7. Módulos y tickets (4, sin subtareas)

Epic `tp4` + 4 tickets. Cada ticket lleva sus actividades como checklist en la
descripción, no como subtareas.

### M1 · Base de datos y servicio `Clientes`

Tablas con Drizzle (`clientes`, `actividades`), conexión SQLite y la clase
`Clientes` con métodos estáticos: listar/buscar, obtener, crear, actualizar,
eliminar, y actividades (listar, crear, actualizar, completar, eliminar).

Actividades:
- [ ] Inicializar el proyecto **en el directorio actual** con **npm**
      (`npm init`, `tsconfig.json`, estructura de carpetas y dependencias).
- [ ] Agregar **`.gitignore` local**: `node_modules/`, `dist/`, `*.db`,
      `*.db-shm`, `*.db-wal`, `.env`.
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

## 8. Acciones en Jira ya ejecutadas

1. Epic `SCRUM-5` conservado y descripción ajustada a este plan.
2. Los 8 tickets del plan anterior (`SCRUM-6` a `SCRUM-13`) y sus 40 subtareas
   quedaron **cancelados**. El MCP de Atlassian no tiene permiso de borrado
   (`delete:jira:agent-interface` no está entre los scopes).
3. Creados los 4 tickets de la sección 7, sin subtareas, con el checklist en la
   descripción y labels `tp4` + `legajo-63392`.

## 9. Cambio aplicado (setup con npm + .gitignore)

Aprobado y ejecutado:

- **M1 (`SCRUM-54`)** tiene como primeras actividades: inicializar el proyecto
  **en el directorio actual** con **npm** y agregar un **`.gitignore` local**
  (`node_modules/`, `dist/`, `*.db`, `*.db-shm`, `*.db-wal`, `.env`). No se creó
  ningún ticket nuevo.
- **`AGENTS.md`** refleja que el proyecto se inicializa en `tp4/` con npm y que
  el `.gitignore` local cubre la base SQLite, que la raíz del repo no ignora.

Ese setup no es un requisito del enunciado: es el trabajo necesario para
arrancar, y queda dentro de M1 para no volver a agregar tickets.

## 10. Verificación final

- `npm run build` sin errores y servidor levantado.
- Pruebas manuales de API y de UI.
- Checker del docente, desde la raíz del repo:

```bash
node sistema/tools/probar-tp4.js 63392
```

Ese checker solo verifica presencia; la validación real es manual.
