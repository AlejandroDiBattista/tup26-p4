# MiniCRM

Aplicación de gestión de clientes y actividades con Node.js, TypeScript, Express, Drizzle ORM y SQLite.

## Requisitos

- Node.js 22 o superior
- npm

## Ejecutar

Desde esta carpeta:

```sh
npm install
npm start
```

Abrí <http://localhost:3000>. La base SQLite se crea automáticamente en `data/minicrm.sqlite`. Para usar otro puerto, definí la variable `PORT`.

Durante el desarrollo se puede ejecutar `npm run dev`. `npm test` ejecuta una prueba de integración del API.

## API REST

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/clientes?q=texto` | Buscar clientes en todos sus campos y en los campos de sus actividades |
| GET | `/api/clientes/:id` | Obtener ficha y actividades |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Reemplazar datos del cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente y sus actividades |
| GET | `/api/clientes/:id/actividades` | Listar actividades |
| POST | `/api/clientes/:id/actividades` | Crear actividad |
| PUT | `/api/clientes/:id/actividades/:actividadId` | Editar actividad pendiente |
| PATCH | `/api/clientes/:id/actividades/:actividadId/completar` | Completar actividad |
| DELETE | `/api/clientes/:id/actividades/:actividadId` | Eliminar actividad pendiente |

Las actividades completadas son inmutables y se conservan al eliminar individualmente. Al borrar un cliente, SQLite elimina sus actividades relacionadas.
