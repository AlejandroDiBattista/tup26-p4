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

## Reglas de negocio (servicio `Clientes`)

- **Búsqueda flexible:** cada palabra buscada debe aparecer en algún campo (nombre, apellido, email, domicilio, localidad o teléfono).
- **Normalización al guardar:** nombres y localidad en formato Título, email en minúsculas, teléfono solo con dígitos.
- **Actividades:** se consideran *completadas* si tienen fecha de finalización y *vencidas* si están pendientes con fecha de compromiso anterior a hoy.
- Las actividades completadas **no se pueden editar ni borrar** individualmente (solo se borran al eliminar el cliente).

## Estructura

```
src/
  db/
    index.ts    # conexión a SQLite con Drizzle
    schema.ts   # tablas clientes y actividades
    seed.ts     # datos de ejemplo
  services/
    clientes.ts # clase Clientes: CRUD, búsqueda y reglas de negocio
  index.ts      # punto de entrada
```
