import { app } from './app.js';
import { conexion } from './base.js';

const puerto = Number(process.env.PORT || 3100);
const host = process.env.HOST || '127.0.0.1';
const servidor = app.listen(puerto, host, () => {
  console.log(`REST: http://localhost:${puerto}/clientes.html`);
  console.log(`MCP:  http://localhost:${puerto}/clientes-mcp.html`);
  console.log(`Endpoint MCP: http://localhost:${puerto}/mcp`);
});
function cerrar() {
  servidor.close(() => { conexion.close(); process.exit(0); });
}
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
