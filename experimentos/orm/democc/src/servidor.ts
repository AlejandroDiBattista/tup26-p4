import express from 'express';
import { manejarErrores, rutaInexistente } from './api/errores';
import { rutasClientes } from './api/rutas/clientes';
import { configuracion } from './configuracion';
import { rutasMcp } from './mcp/rutas';

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/api/clientes', rutasClientes);
app.use('/api', rutaInexistente);
app.use('/mcp', rutasMcp);
app.use(manejarErrores);

// Express 5 informa en el callback los errores al abrir el puerto (por ejemplo, si está ocupado).
app.listen(configuracion.puerto, (error) => {
  if (error) throw error;
  console.log(`MiniCRM escuchando en http://localhost:${configuracion.puerto}`);
});
