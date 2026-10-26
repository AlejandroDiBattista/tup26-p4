# TP4: MiniCRM

Mini CRM para gestionar clientes y sus actividades, hecho con Node.js, TypeScript, Express, Drizzle y SQLite. La interfaz web usa React cargado desde CDN.

## Cómo ejecutarlo

```bash
npm install
npm run seed   # crea minicrm.sqlite con 10 clientes de ejemplo
npm start      # o "npm run dev" para que se reinicie al guardar cambios
```

Después, abrir <http://localhost:3000>, que redirige a `/MiniCRM.html`.

| Script | Qué hace |
|---|---|
| `npm start` | Levanta el servidor |
| `npm run dev` | Levanta el servidor y lo reinicia al guardar cambios |
| `npm run seed` | Borra los datos y carga los de ejemplo |
| `npm run typecheck` | Revisa los tipos de TypeScript |

## Estructura

```
public/MiniCRM.html          Interfaz (React + JSX embebido + CSS)
src/
  server.ts                  Arranca el servidor
  app.ts                     Configura Express, archivos estáticos y rutas
  db/schema.ts               Tablas clientes y actividades (Drizzle)
  db/index.ts                Conexión a SQLite y creación de tablas
  db/seed.ts                 Datos de ejemplo
  services/clientes.ts       Clase Clientes: CRUD, búsqueda y reglas de negocio
  services/errores.ts        Errores de negocio con su código HTTP
  controllers/               Traducen HTTP <-> servicio
  routes/                    Asocian URLs a controladores
  middlewares/errores.ts     Respuestas de error en JSON
```

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes?q=texto` | Lista clientes; cada palabra de `q` debe aparecer en algún campo |
| POST | `/api/clientes` | Crea un cliente (`nombre` obligatorio) |
| GET | `/api/clientes/:id` | Ficha del cliente con sus actividades |
| PUT | `/api/clientes/:id` | Modifica un cliente |
| DELETE | `/api/clientes/:id` | Elimina el cliente y sus actividades |
| POST | `/api/clientes/:id/actividades` | Agrega una actividad (`descripcion`, `fecha` opcional) |
| PUT | `/api/actividades/:id` | Modifica una actividad pendiente |
| POST | `/api/actividades/:id/completar` | Marca una actividad como completada |
| DELETE | `/api/actividades/:id` | Elimina una actividad pendiente |

Los errores se devuelven como `{ "error": "mensaje" }`:

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos |
| 404 | El cliente o la actividad no existe |
| 409 | Se intenta editar o borrar una actividad completada |

## Reglas de negocio

- El nombre del cliente es obligatorio y el email, si se carga, debe ser válido.
- Las actividades tienen descripción obligatoria y fecha opcional (`AAAA-MM-DD`).
- Las actividades completadas no se pueden editar ni borrar individualmente. Solo se borran al eliminar su cliente.
