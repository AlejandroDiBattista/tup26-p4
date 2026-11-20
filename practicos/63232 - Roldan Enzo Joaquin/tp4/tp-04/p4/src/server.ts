import { crearApp } from './app';
import { crearBaseDatos } from './db';

const puerto = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('PORT debe ser un número entero entre 1 y 65535.');
}

const { db, cerrar } = crearBaseDatos();
const servidor = crearApp(db).listen(puerto, () => {
  console.log(`MiniCRM disponible en http://localhost:${puerto}`);
});

function apagar() {
  servidor.close((error) => {
    cerrar();
    if (error) {
      console.error('No se pudo cerrar el servidor correctamente:', error);
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', apagar);
process.on('SIGTERM', apagar);
