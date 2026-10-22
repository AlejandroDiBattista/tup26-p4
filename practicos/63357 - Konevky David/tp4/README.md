# MiniCRM

Mini CRM con Node.js, TypeScript, Express, Drizzle y SQLite (local en desarrollo, Turso en producción). Interfaz en React (CDN) en `public/MiniCRM.html`.

## Instalación

Requiere Node.js 20 o superior.

```
npm install
npm run db:push
npm run db:seed
```

`db:push` crea las tablas en `minicrm.sqlite` (archivo local) y `db:seed` carga 10 clientes de ejemplo con actividades (se puede repetir sin duplicar datos).

## Ejecución

```
npm run dev      # con recarga automática
npm start        # sin recarga
```

Abrir http://localhost:3005/MiniCRM.html

## Pruebas

```
npm test
npm run typecheck
```

Las pruebas usan una base aparte (`test.sqlite`), sin tocar `minicrm.sqlite`.

## Producción (Turso)

Sin variables de entorno se usa el archivo local. Para usar Turso:

```
TURSO_DATABASE_URL=libsql://<tu-base>.turso.io
TURSO_AUTH_TOKEN=<token>
```

Crear las tablas en Turso con esas variables definidas: `npm run db:push`.

## Estructura

- `src/db/schema.ts`: tablas (`clientes`, `actividades`).
- `src/db/index.ts`: conexión Drizzle (SQLite local o Turso).
- `src/index.ts`: servidor Express.
- `public/MiniCRM.html`: interfaz web.
- `test/`: pruebas.
