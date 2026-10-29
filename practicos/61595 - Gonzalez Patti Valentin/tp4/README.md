# TP4 — MiniCRM

Base mínima con Node.js, Express, TypeScript, Drizzle ORM y SQLite local.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```sh
npm install
```

## Ejecución

Modo desarrollo con recarga automática:

```sh
npm run dev
```

Ejecución directa:

```sh
npm start
```

El servidor escucha en `http://localhost:3000` (o en el puerto indicado por `PORT`). La base SQLite se crea localmente en `data/local.db` al iniciar.

La interfaz está disponible en `http://localhost:3000/` y en `/microcrm.html`.

## Pruebas

```sh
npm test
```

El comando usa el ejecutor de pruebas integrado de Node.js con soporte para TypeScript mediante `tsx`.

## API REST

La API queda disponible bajo `/api/clientes`:

| Método | Ruta | Operación |
| --- | --- | --- |
| `GET` | `/api/clientes?q=texto` | Lista y busca clientes y sus actividades |
| `POST` | `/api/clientes` | Crea un cliente |
| `GET` | `/api/clientes/:clienteId` | Obtiene un cliente con sus actividades |
| `PUT` / `PATCH` | `/api/clientes/:clienteId` | Actualiza un cliente |
| `DELETE` | `/api/clientes/:clienteId` | Elimina un cliente |
| `GET` / `POST` | `/api/clientes/:clienteId/actividades` | Lista o crea actividades |
| `GET` | `/api/clientes/:clienteId/actividades/:actividadId` | Obtiene una actividad |
| `PUT` / `PATCH` / `DELETE` | `/api/clientes/:clienteId/actividades/:actividadId` | Actualiza o elimina una actividad pendiente |
| `POST` | `/api/clientes/:clienteId/actividades/:actividadId/completar` | Completa una actividad; acepta `{ "fechaEjecucion": "AAAA-MM-DD" }` y usa hoy si se omite |

Los cuerpos de creación y actualización se envían como JSON. Los errores se responden como `{ "error": "..." }`.

## Base de datos

Crear o actualizar las tablas y cargar los 10 clientes ficticios con sus actividades:

```sh
npm run db:seed
```

La carga puede repetirse: los identificadores fijos hacen que los registros de ejemplo existentes se omitan. La base se guarda en `data/local.db`.
