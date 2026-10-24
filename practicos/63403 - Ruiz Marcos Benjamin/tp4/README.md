# MiniCRM

Mini CRM para gestionar clientes y sus actividades.

**Tecnologías:** Node.js, TypeScript, Drizzle ORM y SQLite (archivo local `minicrm.db`).

## Requisitos

- Node.js 20 o superior

## Instalación

```bash
npm install
npm run db:setup    # crea las tablas y carga 10 clientes de ejemplo
```

La semilla se puede repetir sin duplicar datos (`npm run db:seed`): los clientes se identifican por email.

## Ejecución

```bash
npm run dev     # modo desarrollo (se reinicia al guardar)
npm start       # ejecución normal
```

El servidor queda en `http://localhost:3000` (se puede cambiar con la variable `PORT`). Al abrir esa dirección se muestra la interfaz web `public/MiniCRM.html`.

## Interfaz web

`public/MiniCRM.html` es una página autocontenida: React 18.3.1 y Babel 7.26.10 se cargan desde CDN con versiones fijas, el JSX va embebido (Babel con *runtime classic*) y los estilos son CSS puro, sin librerías de componentes. Toda la información se obtiene de la API REST.

## Pruebas

```bash
npm run typecheck   # verifica los tipos de TypeScript
```

Para probar la API, abrir `api.http` en VS Code con la extensión **REST Client** y hacer clic en *Send Request* sobre cada pedido.

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes?q=texto` | Lista clientes (búsqueda opcional por cualquier campo) |
| GET | `/api/clientes/:id` | Cliente con sus actividades |
| POST | `/api/clientes` | Crea un cliente |
| PUT | `/api/clientes/:id` | Edita un cliente |
| DELETE | `/api/clientes/:id` | Elimina un cliente y sus actividades |
| GET | `/api/clientes/:clienteId/actividades` | Lista las actividades del cliente |
| POST | `/api/clientes/:clienteId/actividades` | Crea una actividad |
| PUT | `/api/clientes/:clienteId/actividades/:id` | Edita una actividad pendiente |
| POST | `/api/clientes/:clienteId/actividades/:id/completar` | Completa una actividad |
| DELETE | `/api/clientes/:clienteId/actividades/:id` | Elimina una actividad pendiente |

Los errores se devuelven como `{ "error": "mensaje" }` con código 400 (datos inválidos), 404 (no encontrado) o 409 (email duplicado o actividad completada).

## Modelo

- **clientes**: id, nombre, apellido, email (único) y opcionalmente domicilio, localidad y teléfono.
- **actividades** (1:n con clientes): id, descripción, fecha de compromiso (opcional, `null` = sin fecha) y fecha de finalización (solo se llena al completarla). Se borran junto con su cliente.

## Reglas de negocio (servicio `Clientes`)

- **Búsqueda flexible:** cada palabra buscada debe aparecer en algún campo (nombre, apellido, email, domicilio, localidad o teléfono).
- **Normalización al guardar:** nombres y localidad en formato Título, email en minúsculas, teléfono solo con dígitos.
- **Actividades:** se consideran *completadas* si tienen fecha de finalización y *vencidas* si están pendientes con fecha de compromiso anterior a hoy.
- Las actividades completadas **no se pueden editar ni borrar** individualmente (solo se borran al eliminar el cliente).

## Estructura

```
public/
  MiniCRM.html  # interfaz web (React + CSS)
src/
  db/
    index.ts    # conexión a SQLite con Drizzle
    schema.ts   # tablas clientes y actividades
    seed.ts     # datos de ejemplo
  services/
    clientes.ts # clase Clientes: CRUD, búsqueda y reglas de negocio
  controllers/  # traducen HTTP <-> servicio (sin reglas de negocio)
  routes/       # definen las rutas y las asocian a los controladores
  middlewares/  # manejo de errores
  app.ts        # configuración de Express
  index.ts      # inicia el servidor
```
