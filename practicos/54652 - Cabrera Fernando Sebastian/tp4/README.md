# TP4: MiniCRM

Fernando Sebastián Cabrera, legajo 54652.

MiniCRM para gestionar clientes y sus actividades. Hecho con Node.js, TypeScript, Express, Drizzle y SQLite, con una interfaz en React.

## Cómo ejecutarlo

```bash
npm install
npm run db:push    # crea las tablas en minicrm.db
npm run db:seed    # carga 10 clientes de ejemplo con sus actividades
npm run dev        # http://localhost:3000
```

## Estructura

```
src/
  index.ts                  servidor Express, archivos estáticos y manejo de errores
  errores.ts                HttpError: error de negocio con su código HTTP
  db/schema.ts              tablas clientes y actividades
  db/index.ts               conexión a SQLite (con claves foráneas activadas)
  db/seed.ts                datos de ejemplo
  services/clientes.ts      clase Clientes: métodos estáticos y reglas de negocio
  controllers/              traducen HTTP ⇄ servicio
  routes/                   asocian cada URL con su controlador
public/MiniCRM.html         interfaz en React (JSX embebido, bibliotecas por CDN)
```

## API REST

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/api/clientes?q=texto` | Lista los clientes; `q` busca por cualquier campo, sin distinguir acentos ni mayúsculas |
| GET | `/api/clientes/:id` | Ficha del cliente con `pendientes` y `completadas` |
| POST | `/api/clientes` | Crea un cliente (`nombre` es obligatorio) |
| PUT | `/api/clientes/:id` | Modifica un cliente |
| DELETE | `/api/clientes/:id` | Elimina el cliente y sus actividades |
| POST | `/api/clientes/:id/actividades` | Agrega una actividad (`descripcion` y `fecha` opcional) |
| PUT | `/api/actividades/:id` | Edita una actividad pendiente |
| POST | `/api/actividades/:id/completar` | Marca una actividad como completada |
| DELETE | `/api/actividades/:id` | Elimina una actividad pendiente |

Los errores responden con `{ "error": "mensaje" }`: 400 (datos inválidos), 404 (no existe) y 409 (actividad ya completada).

## Reglas de negocio (en `services/clientes.ts`)

- El nombre del cliente es obligatorio; el email, si se carga, debe ser válido.
- La fecha de una actividad es opcional y tiene el formato AAAA-MM-DD.
- Una actividad completada no se puede editar, volver a completar ni borrar individualmente (409).
- Al eliminar un cliente se borran sus actividades (borrado en cascada).
