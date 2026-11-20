# TP4: MiniCRM

Mini CRM para la gestión ágil de clientes y sus actividades de seguimiento, desarrollado con Node.js, TypeScript, Drizzle ORM y SQLite, exponiendo una API REST modular y una interfaz interactiva en React (con JSX embebido y CSS puro).

## Decisiones de Arquitectura y Elecciones Técnicas

1. **Backend Modular en Capas**:
   - **Capa de Datos (`src/db.ts`)**: Se utiliza `better-sqlite3` junto con `drizzle-orm` para definir esquemas fuertemente tipados (`clientes` y `actividades`) con clave foránea en cascada (`ON DELETE CASCADE`). Se asegura la inicialización automática de tablas SQLite en el arranque.
   - **Capa de Negocio / Servicio (`src/clientes.service.ts`)**: Clase `Clientes` con métodos estáticos para operaciones CRUD. Implementa la búsqueda multi-palabra flexible sobre cualquier campo (`nombre`, `apellido`, `email`, `domicilio`, `localidad`, `telefono`). Normaliza los datos antes de persistir (eliminación de espacios, minúsculas en emails). Gestiona el cálculo reactivo del estado de actividades (vencidas, completadas) y previene la edición o borrado de actividades completadas.
   - **Capa de Controladores (`src/controllers.ts`)**: Recibe peticiones HTTP, parsea argumentos y delega la ejecución al servicio `Clientes`, respondiendo con códigos de estado HTTP semánticos (200, 201, 204, 400, 404, 409).
   - **Capa de Enrutamiento (`src/routers.ts`)**: Define las rutas RESTful (`/api/clientes` y sus actividades hijas `/api/clientes/:clienteId/actividades`, así como endpoints específicos para `/api/actividades/:id`).
   - **Servidor y Archivos Estáticos (`src/server.ts`)**: Configura Express, middleware de JSON, montaje de rutas `/api` y servicio de la carpeta `public/` en el puerto 3000. Redirige `/` a `MiniCRM.html`.

2. **Frontend React SPA Autónomo (`public/MiniCRM.html`)**:
   - Carga reactiva de bibliotecas desde CDN con versiones estables fijas (`React 18.3.1`, `ReactDOM 18.3.1`, `Babel Standalone 7.24.7`).
   - Configuración clásica de Babel con runtime global de React.
   - Diseño idéntico a la referencia visual (`minicrm.jpg`): barra de navegación superior oscura, layout de 2 paneles (Maestro a la izquierda y Detalle a la derecha), altura fija al 100% de la ventana sin scroll global (`overflow: hidden`), con scrollbars independientes en la lista de clientes y en las actividades.
   - Búsqueda en vivo con debounce de 200 ms.
   - Clasificación de actividades:
     - **Compromisos**: ordenados primero los sin fecha, luego vencidos (resaltados en rojo), y finalmente próximos en orden cronológico ascendente.
     - **Actividades completadas**: estilo distintivo con fondo suave, checkbox tildado bloqueado, ordenadas descendentemente por fecha de finalización.
   - Subformulario en línea con borde de puntos redondeado para crear y editar compromisos de manera rápida e intuitiva.

## Instrucciones de Instalación y Ejecución

### 1. Requisitos Previos
- Node.js versión 20 o superior instalada.

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Cargar Datos Iniciales (Seed)
Crea y puebla la base de datos `minicrm.sqlite` con 10 clientes de ejemplo y sus respectivas actividades pendientes y completadas:
```bash
npm run seed
```

### 4. Iniciar el Servidor
Modo producción / normal:
```bash
npm start
```
O modo desarrollo con recarga automática:
```bash
npm run dev
```

### 5. Acceder a la Aplicación
Abrir el navegador web en:
[http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

| Script | Descripción |
|---|---|
| `npm start` | Inicia el servidor con `tsx src/server.ts` |
| `npm run dev` | Inicia el servidor en modo observación (`watch`) |
| `npm run seed` | Inicializa y siembra 10 clientes con actividades en SQLite |
| `npm run typecheck` | Valida la integridad estática de tipos con `tsc --noEmit` |

## Endpoints de la API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/clientes?q=texto` | Busca clientes por cualquier término en cualquiera de sus campos |
| `POST` | `/api/clientes` | Crea un nuevo cliente |
| `GET` | `/api/clientes/:id` | Obtiene la ficha de un cliente con su lista de actividades |
| `PUT` | `/api/clientes/:id` | Modifica los datos del cliente |
| `DELETE` | `/api/clientes/:id` | Elimina el cliente y sus actividades asociadas |
| `GET` | `/api/clientes/:clienteId/actividades` | Lista las actividades de un cliente |
| `POST` | `/api/clientes/:clienteId/actividades` | Registra una nueva actividad |
| `PUT` | `/api/actividades/:id` | Modifica una actividad pendiente |
| `PATCH` / `POST` | `/api/actividades/:id/completar` | Marca la actividad como completada |
| `DELETE` | `/api/actividades/:id` | Elimina una actividad pendiente |
