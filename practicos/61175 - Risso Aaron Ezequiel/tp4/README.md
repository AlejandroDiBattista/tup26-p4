# TP4 MiniCRM

Base mínima del proyecto con Node.js, TypeScript, Express, Drizzle ORM y SQLite local.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:3000`. Se puede cambiar el puerto definiendo la variable de entorno `PORT`.

## Compilación y ejecución

```bash
npm run build
npm start
```

La compilación TypeScript se genera en `dist/`. La conexión local de SQLite está configurada en `src/db/index.ts` y usa el archivo `data/minicrm.sqlite`.

## Esquema de datos

El esquema Drizzle está en `src/db/schema.ts`. Para generar una migración después de modificarlo:

```bash
npm run db:generate -- --name=descripcion_del_cambio
npm run db:migrate
```

Las migraciones generadas quedan en `drizzle/` y se aplican a `data/minicrm.sqlite` con `db:migrate`.

## Seed local

Con las dependencias instaladas y las migraciones aplicadas, ejecutar desde esta carpeta:

```bash
npm run db:seed
```

El seed usa los primeros diez nombres y teléfonos de la comisión C1. Solo copia esos campos; no incluye legajo, GitHub, asistencia, parcial ni prácticos. Como `email` es obligatorio en el modelo, agrega direcciones ficticias con el dominio reservado `.invalid`; no son correos reales ni verificados. El seed actualiza por ese correo ficticio y busca las actividades por cliente y descripción dentro de una transacción, por lo que se puede volver a ejecutar sin duplicar los registros. Crea diez actividades que cubren los estados de prueba: pendientes sin fecha, vencidas, futuras y completadas.
