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

## Pruebas

```bash
npm run typecheck   # verifica los tipos de TypeScript
```

## Modelo

- **clientes**: id, nombre, apellido, email (único) y opcionalmente domicilio, localidad y teléfono.
- **actividades** (1:n con clientes): id, descripción, fecha de compromiso (opcional, `null` = sin fecha) y fecha de finalización (solo se llena al completarla). Se borran junto con su cliente.

## Estructura

```
src/
  db/
    index.ts    # conexión a SQLite con Drizzle
    schema.ts   # tablas clientes y actividades
    seed.ts     # datos de ejemplo
  index.ts      # punto de entrada
```
