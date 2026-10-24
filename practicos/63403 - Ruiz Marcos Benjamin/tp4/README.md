# MiniCRM

Mini CRM para gestionar clientes y sus actividades.

**Tecnologías:** Node.js, TypeScript, Drizzle ORM y SQLite (archivo local `minicrm.db`).

## Requisitos

- Node.js 20 o superior

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev     # modo desarrollo (se reinicia al guardar)
npm start       # ejecución normal
```

## Pruebas

```bash
npm run typecheck   # verifica los tipos de TypeScript
```

## Estructura

```
src/
  db/
    index.ts    # conexión a SQLite con Drizzle
    schema.ts   # definición de tablas
  index.ts      # punto de entrada
```
