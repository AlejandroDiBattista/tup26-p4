# Drizzle + SQLite + Turso

Proyecto Node.js con TypeScript, Drizzle ORM y `@libsql/client`. Funciona con SQLite local de forma predeterminada o con Turso mediante variables de entorno.

## Empezar en local

```sh
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

La base local `local.db` se crea al ejecutar las migraciones.

## Usar Turso

Copia `.env.example` a `.env` y configura `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`. Puedes obtenerlos con la CLI de Turso:

```sh
turso db create mi-base
turso db show mi-base --url
turso db tokens create mi-base
```

Luego ejecuta `npm run db:migrate`. No guardes el token en el repositorio.

## Scripts

- `npm run dev`: ejecuta el ejemplo de inserción y consulta.
- `npm run db:generate`: genera migraciones a partir del esquema.
- `npm run db:migrate`: aplica las migraciones al destino configurado.
- `npm run db:studio`: abre Drizzle Studio.
- `npm run typecheck`: verifica los tipos TypeScript.
