# MiniCRM

TP4: aplicación para gestionar clientes y sus actividades, construida con Node.js, TypeScript, Express, Drizzle y SQLite.

## Uso

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Abrir `http://localhost:3000/MiniCRM.html`.

La API incluye CRUD de clientes, búsqueda con `GET /api/clientes?q=texto`, y alta, edición, completado y eliminación de actividades. Las actividades completadas no pueden editarse ni eliminarse individualmente.
