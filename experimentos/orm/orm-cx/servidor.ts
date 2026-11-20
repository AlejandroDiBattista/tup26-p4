import express from 'express';
import { fileURLToPath } from 'node:url';
import { cliente } from './db.js';
import { clientesRouter } from './routers/clientes.js';

import { mcpRouter } from './mcp.js';

const app = express();
const puerto = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));
app.use('/api/clientes', clientesRouter);
app.use('/mcp', mcpRouter);

const servidor = app.listen(puerto, () => {
  console.log(`Página de clientes: http://localhost:${puerto}/clientes.html`);
  console.log(`Página MCP: http://localhost:${puerto}/clientes-mcp.html`);
  console.log(`API disponible en http://localhost:${puerto}/api`);
});

function cerrar() {
  servidor.close(() => {
    cliente.close();
    process.exit(0);
  });
}

process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
