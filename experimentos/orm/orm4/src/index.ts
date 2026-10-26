import { app } from './app.js';
import { cargarDatosIniciales } from './db/inicializar.js';

const puerto = Number(process.env.PORT ?? 3000);

await cargarDatosIniciales();
app.listen(puerto, () => console.log(`API escuchando en http://localhost:${puerto}`));
