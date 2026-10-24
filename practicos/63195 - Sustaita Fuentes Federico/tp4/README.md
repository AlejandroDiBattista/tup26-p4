# TP4: MiniCRM

Mini CRM con Node.js, TypeScript, Express, Drizzle ORM sobre SQLite y una interfaz en React.

## Cómo ejecutarlo

```bash
npm install
npm start
```

Abrir <http://localhost:3000> (redirige a `public/MiniCRM.html`).

La base `minicrm.sqlite` se crea sola al arrancar: se aplican las migraciones de `drizzle/` y, si está vacía, se carga con clientes de ejemplo.

Otros scripts: `npm run dev` (recarga automática), `npm run typecheck`, `npm run db:generate` (nueva migración si cambia el esquema).

## Estructura

```text
src/
├── server.ts                       arranca el servidor
├── app.ts                          arma Express: JSON, estáticos, /api y errores
├── db/
│   ├── schema.ts                   tablas clientes y actividades
│   ├── index.ts                    conexión SQLite + migraciones
│   └── seed.ts                     datos de ejemplo
├── services/clientes.service.ts    clase Clientes: CRUD, búsqueda y reglas de negocio
├── controllers/                    traducen HTTP <-> servicio
├── routes/                         routers de Express
├── middlewares/                    validación del :id y manejo de errores
└── utils/errores.ts                errores de negocio
public/MiniCRM.html                 interfaz React (CDN, JSX embebido y CSS)
```

## API REST

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/clientes?q=texto&campo=email` | Buscar en cualquier campo (o en uno con `campo`) |
| GET | `/api/clientes/:id` | Ficha con `compromisos` y `completadas` |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente y sus actividades |
| POST | `/api/clientes/:id/actividades` | Agregar actividad |
| PUT | `/api/actividades/:id` | Editar actividad pendiente |
| POST | `/api/actividades/:id/completar` | Completar actividad |
| DELETE | `/api/actividades/:id` | Eliminar actividad pendiente |

Reglas en el servicio: nombre, apellido y email obligatorios; email válido y único; descripción obligatoria y fecha opcional `AAAA-MM-DD`; las actividades completadas no se pueden editar, completar de nuevo ni borrar individualmente (responde 409).
