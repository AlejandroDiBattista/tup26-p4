# MiniCRM didáctico

Proyecto de Node.js con TypeScript, Express, Drizzle y SQLite. La base local por defecto se guarda en `local.db`. El backend ofrece API REST y MCP Streamable HTTP sobre la misma clase de servicio y los mismos datos.

## Preparación

1. Instala Node.js LTS.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env` si necesitas cambiar el puerto o configurar el servicio remoto.
4. Para SQLite local no hace falta completar variables.

## Base de datos y semilla

`npm run db:push` aplica el esquema actual. `npm run db:seed` agrega diez clientes ficticios y actividades de muestra; se puede repetir sin duplicar. Actividades comprenden fechas vencidas, futuras, sin compromiso y completadas.

SQLite local usa `local.db`. Para Turso, configura `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`; si la URL es `file:...`, se usa SQLite local. El mismo esquema Drizzle sirve ambos backends.

## Ejecutar

`npm start` levanta Express en `http://localhost:3000` (o el puerto de `PORT`). Abre:

- `/clientes.html`: interfaz JSX conectada a la API REST.
- `/clientes-mcp.html`: la misma interfaz JSX conectada a las herramientas MCP por HTTP.
- `/api/clientes`: listado REST; agrega `?q=texto` para buscar.
- `/mcp`: endpoint MCP Streamable HTTP (JSON-RPC POST).

## API REST

Los clientes se gestionan en `/api/clientes`. Sus actividades viven bajo `/api/clientes/:clienteId/actividades`, con POST para completarlas en `/:actividadId/completar`. El servicio valida que las actividades pertenezcan al cliente. Al borrar un cliente, SQLite borra sus actividades en cascada. Una actividad completada queda inalterable individualmente.

## MCP

Conecta un cliente MCP compatible al endpoint HTTP `http://localhost:3000/mcp`, con transporte Streamable HTTP y sin estado de sesión. Herramientas: `clientes_listar`, `clientes_buscar`, `clientes_crear`, `clientes_actualizar`, `clientes_eliminar`, `actividades_listar`, `actividades_crear`, `actividades_actualizar`, `actividades_eliminar` y `actividades_completar`.
