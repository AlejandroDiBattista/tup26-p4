# MiniCRM

Trabajo Práctico N.º 4 — Programación 4.

Mini CRM para gestionar clientes y sus actividades (compromisos y completadas), con API REST y una interfaz web maestro-detalle.

## Stack

Únicamente las tecnologías pedidas en el enunciado:

- **Node.js** + **TypeScript**
- **SQLite** con **Drizzle ORM**
- **Express** para la API REST (controladores y routers separados)
- **React 18** + **JSX embebido** + **CSS nativo** en un único `public/MiniCRM.html`, con las bibliotecas cargadas desde CDN con versiones fijas

Sin frameworks de frontend, sin bundler y sin librerías adicionales.

## Requisitos

- Node.js 20 o superior

## Puesta en marcha

```bash
npm install
npm run db:seed   # opcional: carga 7 clientes de ejemplo
npm run dev       # http://localhost:3000
```

Si el puerto 3000 está ocupado:

```bash
PORT=3001 npm run dev
```

### Otros scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Compila con `tsc` e inicia el servidor con `node` |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run typecheck` | Verifica tipos sin emitir |
| `npm run db:seed` | Carga datos de ejemplo si la base está vacía |
| `npm run db:push` | Sincroniza el esquema con Drizzle Kit |

La base de datos (`minicrm.db`) se crea automáticamente al iniciar el servidor.

## API REST

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/clientes?busqueda=` | Lista clientes, con búsqueda flexible por cualquier campo |
| `GET` | `/api/clientes/:id` | Ficha del cliente con `compromisos` y `completadas` |
| `POST` | `/api/clientes` | Crea un cliente |
| `PUT` | `/api/clientes/:id` | Actualiza un cliente |
| `DELETE` | `/api/clientes/:id` | Elimina el cliente y sus actividades (cascada) |
| `GET` | `/api/actividades?clienteId=` | Lista las actividades de un cliente |
| `POST` | `/api/actividades` | Agrega una actividad (`clienteId`, `descripcion`, `fecha`) |
| `PUT` | `/api/actividades/:id` | Edita una actividad pendiente |
| `PATCH` | `/api/actividades/:id/completar` | Marca la actividad como completada |
| `PATCH` | `/api/actividades/:id/reabrir` | Devuelve una completada a compromisos y limpia su fecha de finalización |
| `DELETE` | `/api/actividades/:id` | Elimina una actividad pendiente |

Las actividades completadas no se pueden editar ni eliminar individualmente (`409 Conflict`); para corregirlas se las reabre primero. La acción de reabrir se agregó a pedido, por lo que el checkbox de las completadas es clicable (la especificación de diseño lo indicaba de solo lectura).

## Estructura

```text
tp4/
├── public/
│   └── MiniCRM.html                 # Interfaz React + JSX + CSS
├── src/
│   ├── db/
│   │   ├── schema.ts                # Tablas Drizzle (clientes, actividades)
│   │   ├── index.ts                 # Conexión SQLite + Drizzle
│   │   └── seed.ts                  # Datos de ejemplo
│   ├── services/
│   │   ├── clientes.service.ts      # Clase Clientes con métodos estáticos
│   │   └── errors.ts                # Error HTTP y utilidades de respuesta
│   ├── controllers/
│   │   ├── clientes.controller.ts
│   │   └── actividades.controller.ts
│   ├── routes/
│   │   ├── clientes.routes.ts
│   │   ├── actividades.routes.ts
│   │   └── index.ts
│   └── server.ts                    # Express + estáticos
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## Reglas de negocio

- Toda la lógica vive en la clase `Clientes` (`src/services/clientes.service.ts`).
- Los controladores solo reciben la petición, llaman al servicio y responden.
- La búsqueda del maestro filtra en vivo por nombre, email, teléfono, dirección o ciudad.
- Una actividad completada registra su fecha de finalización y no se puede editar ni borrar mientras siga completada; se puede volver a compromisos desde su checkbox.
- Al eliminar un cliente se eliminan en cascada todas sus actividades.
- La creación y edición de clientes ocurre en el panel de detalle; la de actividades, en el subformulario del detalle.
