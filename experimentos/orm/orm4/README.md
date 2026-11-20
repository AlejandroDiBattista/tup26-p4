# API REST: Drizzle + SQLite + Turso

API REST en TypeScript para administrar clientes y sus actividades. Usa SQLite local por defecto y puede conectarse a Turso cambiando la URL.

## Preparación

```sh
npm install
cp .env.example .env
```

## Iniciar la API

```sh
npm run db:push
npm run dev
```

`db:push` crea o actualiza las tablas directamente desde `src/db/schema.ts`, sin generar archivos de migración. La API queda disponible en `http://localhost:3000` y carga los datos semilla si la base no tiene clientes.

La página web de clientes está en `http://localhost:3000/` y consulta la API desde el navegador. Usa React y JSX cargados desde CDN.

## Usar Turso

En `.env`, cambia `DATABASE_URL` por la URL de la base Turso y agrega su `TURSO_AUTH_TOKEN`. Ejecuta `npm run db:push` para crear o actualizar las tablas de esa base antes de iniciar la API.

## Rutas

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/clientes` | Listar clientes; acepta `?q=texto` para buscar también en sus actividades |
| GET | `/api/clientes/:id` | Obtener un cliente |
| POST | `/api/clientes` | Crear un cliente |
| PUT | `/api/clientes/:id` | Actualizar un cliente |
| DELETE | `/api/clientes/:id` | Eliminar un cliente |
| GET | `/api/actividades` | Listar actividades; acepta `?estado=pendientes`, `vencidas` o `sin-plazo` |
| GET | `/api/actividades/:id` | Obtener una actividad |
| POST | `/api/actividades` | Crear una actividad |
| PUT | `/api/actividades/:id` | Actualizar una actividad |
| DELETE | `/api/actividades/:id` | Eliminar una actividad |

Los handlers procesan las solicitudes y los routers declaran las rutas. El acceso a la base de datos se mantiene en los repositorios.
