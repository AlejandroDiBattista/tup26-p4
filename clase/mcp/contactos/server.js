import { RepositorioContactos } from './repositorio.js';
import { crearServidor } from './mcp.js';

const repositorio = new RepositorioContactos(process.env.CONTACTOS_ARCHIVO);
const servidor = crearServidor(repositorio);
const puerto = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('PORT debe ser un entero entre 1 y 65535');
}

await servidor.start({
  transportType: 'httpStream',
  httpStream: { host: '127.0.0.1', port: puerto, stateless: true, enableJsonResponse: true }
});
console.log(`MCP de contactos disponible en http://127.0.0.1:${puerto}/mcp`);

for (const señal of ['SIGINT', 'SIGTERM']) {
  process.once(señal, async () => {
    await servidor.stop();
    process.exit(0);
  });
}
