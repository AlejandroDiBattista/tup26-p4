# TP4 - MiniCRM

Node.js + TypeScript + Express + Drizzle (SQLite) + React (CDN).

```bash
npm install
npm start      # http://localhost:3000/MiniCRM.html
```

La base `minicrm.db` se crea sola al iniciar, con algunos clientes de ejemplo.

## Estructura

- `src/db` — esquema Drizzle y conexión SQLite.
- `src/services/clientes.service.ts` — clase `Clientes` con métodos estáticos (CRUD, búsqueda por cualquier campo y actividades). Acá están las reglas de negocio.
- `src/controllers`, `src/routes` — API REST con Express.
- `public/MiniCRM.html` — interfaz maestro/detalle en React.

## API

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/clientes?q=texto` | Listar / buscar |
| POST | `/api/clientes` | Crear cliente |
| GET | `/api/clientes/:id` | Cliente con sus actividades |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente (y sus actividades) |
| POST | `/api/clientes/:id/actividades` | Agregar actividad |
| PUT | `/api/clientes/:id/actividades/:actividadId` | Editar actividad pendiente |
| PATCH | `/api/clientes/:id/actividades/:actividadId/completar` | Completar actividad |
| DELETE | `/api/clientes/:id/actividades/:actividadId` | Eliminar actividad pendiente |

Las actividades completadas no se pueden editar ni borrar.
