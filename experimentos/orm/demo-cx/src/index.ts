import { databaseConfig } from './config.js';
import { connect } from './db/connection.js';
import { crearApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe estar entre 1 y 65535.');

const connection = connect(databaseConfig());
const server = crearApp(connection.db).listen(port, () => {
  console.log(`API disponible en http://localhost:${port}/api/clientes`);
});

server.on('error', (error) => {
  console.error(error);
  connection.close();
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close(() => connection.close()));
}
