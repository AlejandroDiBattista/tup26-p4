# MiniCRM

Aplicación web para administrar clientes y sus actividades. El servidor usa Express, TypeScript, Drizzle ORM y SQLite; la interfaz está en `public/MiniCRM.html`.

## Requisitos

- Node.js 20 o posterior.
- npm.
- Conexión a Internet para cargar React y Babel desde los CDN fijados en el HTML.

## Instalar y ejecutar

Desde esta carpeta:

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000/>. La base `minicrm.db` se crea automáticamente en esta carpeta al iniciar la aplicación.

Para generar y ejecutar la versión compilada:

```bash
npm run build
npm start
```

El puerto predeterminado es `3000`; se puede cambiar definiendo la variable de entorno `PORT`. Para usar otro archivo SQLite (por ejemplo, durante una prueba), se puede indicar con `MINICRM_DATABASE_FILE`.

## API

La interfaz consume los siguientes recursos:

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/clientes?q=texto` | Listar y buscar clientes por sus campos |
| `GET` | `/api/clientes/:id` | Consultar la ficha y sus actividades |
| `POST` | `/api/clientes` | Crear un cliente |
| `PUT` | `/api/clientes/:id` | Editar un cliente |
| `DELETE` | `/api/clientes/:id` | Eliminar un cliente y sus actividades |
| `POST` | `/api/clientes/:id/actividades` | Agregar una actividad |
| `PUT` | `/api/clientes/:id/actividades/:actividadId` | Editar una actividad pendiente |
| `PATCH` | `/api/clientes/:id/actividades/:actividadId/completar` | Completar una actividad pendiente |
| `DELETE` | `/api/clientes/:id/actividades/:actividadId` | Eliminar una actividad pendiente |

Los endpoints de escritura reciben y devuelven JSON. Los datos requeridos para crear o editar un cliente son `nombre` y `email`; para una actividad, `descripcion`. La fecha de actividad es opcional y usa el formato `AAAA-MM-DD`.
