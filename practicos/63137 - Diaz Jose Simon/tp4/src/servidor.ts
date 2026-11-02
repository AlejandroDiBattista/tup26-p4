import { fileURLToPath } from 'node:url';
import express from 'express';

const PUERTO = 3000;
const CARPETA_PUBLICA = fileURLToPath(new URL('../public', import.meta.url));

const aplicacion = express();

aplicacion.use(express.static(CARPETA_PUBLICA));

aplicacion.listen(PUERTO, () => {
  console.log(`MiniCRM en http://localhost:${PUERTO}/MiniCRM.html`);
});
