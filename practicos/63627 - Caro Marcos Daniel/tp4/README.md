# TP4 - MiniCRM

Base inicial para el MiniCRM. La aplicación se organiza por capas: persistencia, servicio, controlador, rutas y servidor web. Las reglas de negocio y el CRUD completo se incorporarán en el servicio en las siguientes etapas.

## Arquitectura

```text
tp4/
├── data/                         # Base SQLite local (generada, no versionada)
├── drizzle/                      # Migraciones generadas por Drizzle Kit
├── public/
│   └── MiniCRM.html              # Interfaz React + JSX + CSS (etapa frontend)
├── src/
│   ├── controllers/              # Traduce HTTP a llamadas al servicio
│   │   └── clientes.controller.ts
│   ├── db/                       # Conexión, esquema y tipos inferidos
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── middleware/               # Manejo común de errores HTTP
│   │   └── error-handler.ts
│   ├── routes/                   # Endpoints y composición de routers
│   │   └── clientes.routes.ts
│   ├── services/                 # Reglas de negocio y acceso a datos
│   │   └── clientes.service.ts
│   ├── app.ts                    # Configuración de Express
│   └── server.ts                 # Punto de entrada y arranque
├── .env.example
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

### Responsabilidades y flujo

1. `db/schema.ts` define clientes y actividades. Cada actividad pertenece a un cliente; al eliminar el cliente, SQLite elimina sus actividades relacionadas.
2. `db/index.ts` configura SQLite con claves foráneas activas y exporta la instancia tipada de Drizzle.
3. `services/` concentra las reglas de negocio y las operaciones de persistencia. Los controladores no deben consultar la base directamente.
4. `controllers/` recibe la solicitud HTTP, invoca el servicio y forma la respuesta.
5. `routes/` mapea URLs y métodos HTTP a controladores.
6. `app.ts` compone middlewares y rutas; `server.ts` configura el puerto e inicia Express.
7. `public/MiniCRM.html` se servirá como frontend estático y consumirá la API REST, sin acceder a la base directamente.

El flujo para consultar clientes es:

```text
GET /api/clientes
  → router
  → ClientesController.listar
  → Clientes.listar
  → Drizzle / SQLite
```

## Orden de implementación

1. Modelo y persistencia: esquema, conexión y creación de la base.
2. Servicio `Clientes`: CRUD de clientes, búsqueda flexible y operaciones de actividades.
3. API REST: controladores y rutas para clientes y actividades.
4. Interfaz en `public/MiniCRM.html`: maestro-detalle, formularios y consumo de la API.
5. Pruebas, datos de ejemplo y documentación final.

El servidor MCP es una mejora opcional posterior y, si se incorpora, reutilizará el servicio existente.

## Puesta en marcha

Requiere Node.js y npm.

```powershell
npm install
Copy-Item .env.example .env
npm run db:push
npm run dev
```

La API inicial expone `GET http://localhost:3000/api/clientes`. Responde con una lista vacía hasta que se agregue el CRUD. Para compilar y ejecutar la versión compilada:

```powershell
npm run build
npm start
```
