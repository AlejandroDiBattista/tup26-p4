import { fileURLToPath } from 'node:url';
import express from 'express';
import { rutasDeClientes } from './rutas/clientes.ts';
import { rutasDeActividades } from './rutas/actividades.ts';
import { manejarErrores } from './controladores/errores.ts';

const PUERTO = 3000;
const CARPETA_PUBLICA = fileURLToPath(new URL('../public', import.meta.url));

const aplicacion = express();

aplicacion.use(express.json());
aplicacion.use(express.static(CARPETA_PUBLICA));
aplicacion.use('/api/clientes', rutasDeClientes);
aplicacion.use('/api/actividades', rutasDeActividades);
aplicacion.use(manejarErrores);

aplicacion.listen(PUERTO, () => {
  console.log(`MiniCRM en http://localhost:${PUERTO}/MiniCRM.html`);
});
