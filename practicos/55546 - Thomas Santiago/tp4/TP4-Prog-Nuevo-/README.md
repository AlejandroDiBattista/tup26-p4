# MiniCRM

MiniCRM es una aplicación web sencilla para administrar clientes y las actividades relacionadas con cada uno. Este trabajo práctico utiliza **Node.js, TypeScript, Express, Drizzle ORM y SQLite** en el backend, y una página con **React, JSX y CSS** en el frontend.

## ¿Qué permite hacer?

- Ver y buscar clientes por nombre, apellido, email, teléfono, empresa, dirección o notas.
- Crear, editar y eliminar clientes.
- Consultar la ficha del cliente seleccionado.
- Agregar actividades a un cliente, con título, descripción y fecha.
- Editar actividades pendientes y marcarlas como completadas.
- Consultar actividades pendientes y completadas. Las actividades completadas no se pueden editar ni eliminar individualmente.
- Al eliminar un cliente, eliminar también sus actividades asociadas.

## Tecnologías y organización

```text
backend/
  src/
    index.ts                     Inicio del servidor Express y rutas
    db.ts                        Conexión e inicialización de SQLite
    db/schema.ts                 Definición de tablas con Drizzle
    routes/clientes.routes.ts    Endpoints HTTP
    controllers/                 Recepción de solicitudes y respuestas
    services/clientes.service.ts Reglas de negocio y operaciones CRUD
  data/                          SQLite local (se crea al ejecutar el backend)

frontend/
  index.html                     Entrada que redirige al MiniCRM
  public/MiniCRM.html            Interfaz React del trabajo práctico
  productos.html                Página anterior de productos, separada del CRM
```

El navegador envía solicitudes HTTP a la API de Express. Las rutas las derivan a controladores, y estos usan el servicio `Clientes` para aplicar las reglas y consultar o modificar la base de datos.

## Requisitos

- Node.js compatible con Vite 8 (por ejemplo, Node 20.19 o posterior, o Node 22.12 o posterior).
- npm, que se instala junto con Node.js.
- Conexión a Internet para que `MiniCRM.html` pueda descargar React, ReactDOM y Babel desde las direcciones CDN especificadas en la página.

**No hace falta instalar ni configurar un servidor de base de datos externo.** SQLite guarda los datos en un archivo local y `better-sqlite3` permite que Node.js acceda a él.

## Instalación y ejecución

Las carpetas `node_modules` contienen las dependencias instaladas por npm. No se suben a GitHub para mantener liviano el repositorio, pero son necesarias para ejecutar la aplicación. Después de clonar o descargar el proyecto, hay que volver a instalarlas con `npm install` en las carpetas `backend` y `frontend`, como se indica a continuación.

Abre dos terminales. En ambas, usa la carpeta del proyecto que contiene `backend` y `frontend`.

### 1. Instalar dependencias

Ejecuta una vez en cada carpeta:

```powershell
cd "C:\ruta\al\proyecto\backend"
npm install
```

```powershell
cd "C:\ruta\al\proyecto\frontend"
npm install
```

Reemplaza `C:\ruta\al\proyecto` con la ubicación real del repositorio. Por ejemplo:

```powershell
cd "C:\Users\santi\TP4-Prog-Nuevo-\backend"
npm install
```

### 2. Iniciar el backend

En la primera terminal:

```powershell
cd "C:\ruta\al\proyecto\backend"
npm start
```

Al iniciarse, el backend crea la carpeta `backend/data` si no existe, abre `backend/data/minicrm.db` y crea las tablas necesarias si todavía no están. Debe mostrar que la API escucha en `http://localhost:3000`.

### 3. Iniciar el frontend

En la segunda terminal:

```powershell
cd "C:\ruta\al\proyecto\frontend"
npm run dev
```

Abre en el navegador la dirección local que indique Vite, normalmente `http://localhost:5173/`. La página principal redirige a `MiniCRM.html`. También se puede abrir directamente `http://localhost:5173/MiniCRM.html`.

**Mantén las dos terminales abiertas:** el frontend necesita que el backend siga ejecutándose para consultar clientes y guardar cambios. Para detener un servidor, usa `Ctrl+C` en la terminal correspondiente.

## La base de datos SQLite

La aplicación usa dos tablas:

### `clientes`

Guarda el nombre y apellido (obligatorios), email, teléfono, empresa, dirección, notas y las fechas de creación y actualización.

### `actividades`

Guarda el cliente asociado, título (obligatorio), descripción, fecha, estado de completado y las fechas de creación y actualización. La relación con `clientes` tiene eliminación en cascada: al borrar un cliente también se borran sus actividades.

El esquema de las tablas está descrito en `backend/src/db/schema.ts`. Al iniciar el servidor, `backend/src/db.ts` crea el archivo y las tablas cuando aún no existen. Por eso, en una instalación nueva la base comienza vacía y se va poblando al usar el formulario. **El archivo `.db` contiene los datos reales de cada instalación;** conviene hacer una copia de seguridad si se quiere conservarlos.

La base local está excluida de Git mediante `backend/.gitignore`. Al clonar o descargar el proyecto, cada persona obtiene su propio archivo SQLite al arrancar el backend. No se necesita compartir ni subir la base de datos para que el programa funcione.

## API REST

Todas las rutas de clientes y actividades están bajo `/api`. El endpoint `/health` sirve para comprobar que el servidor está activo.

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/health` | Comprobar el estado del backend |
| `GET` | `/api/clientes` | Listar clientes y sus actividades |
| `GET` | `/api/clientes?search=texto` | Buscar en los campos del cliente |
| `GET` | `/api/clientes/:id` | Consultar un cliente por ID |
| `POST` | `/api/clientes` | Crear un cliente |
| `PUT` | `/api/clientes/:id` | Actualizar un cliente |
| `DELETE` | `/api/clientes/:id` | Eliminar el cliente y sus actividades |
| `POST` | `/api/clientes/:clienteId/actividades` | Agregar una actividad a un cliente |
| `PUT` | `/api/actividades/:id` | Editar una actividad pendiente |
| `PATCH` | `/api/actividades/:id/completar` | Completar una actividad |
| `DELETE` | `/api/actividades/:id` | Eliminar una actividad pendiente |

Por ejemplo, `http://localhost:3000/health` debe responder:

```json
{"ok":true,"service":"MiniCRM API"}
```

## Comprobaciones

Para generar la versión de producción del frontend:

```powershell
cd "C:\ruta\al\proyecto\frontend"
npm run build
```

Para comprobar los tipos TypeScript del backend:

```powershell
cd "C:\ruta\al\proyecto\backend"
npx tsc --noEmit
```

## Nota sobre la página de productos

`frontend/productos.html` y las rutas antiguas de productos pertenecen a una versión previa del proyecto. No forman parte del MiniCRM descrito en el enunciado y no están conectadas al backend SQLite activo. Esa implementación anterior usa Prisma y MySQL, y requeriría una configuración separada. Para probar y presentar el trabajo práctico, utiliza la página principal del MiniCRM.
