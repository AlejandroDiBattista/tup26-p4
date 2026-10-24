import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

//importar las rutas
import clientesRouter from './routers/clientes.routes.js';
import actividadesRouter from './routers/actividades.routes.js';

const app=express();
const PUERTO = process.env.PORT || 3000;

//middleware para interpretar json
app.use(express.json());
//carpeta donde esta el tp-micrm
app.use(express.static(path.resolve('.')));

//rutas de la api rest
app.use('/api/clientes', clientesRouter);
app.use('/api/actividades', actividadesRouter);

//iniciar servidor
app.listen(PUERTO, ()=>{
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
})