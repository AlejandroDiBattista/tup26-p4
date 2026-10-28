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

## Pruebas

```sh
npm test
```

El comando usa el ejecutor de pruebas integrado de Node.js con soporte para TypeScript mediante `tsx`.

## Esquema de base de datos

Después de definir tablas en `src/db/schema.ts`, aplicar el esquema local con:

```sh
npm run db:push
```
