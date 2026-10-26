import { app } from './app.js';
import { sqlite } from './db/index.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe estar entre 1 y 65535.');
const server = app.listen(port, '127.0.0.1', () => console.log(`MiniCRM disponible en http://localhost:${port}/MiniCRM.html`));
server.on('error', (error) => {
  console.error(`No se pudo iniciar MiniCRM: ${error.message}`);
  sqlite.close();
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close(() => { sqlite.close(); process.exit(0); }));
}
