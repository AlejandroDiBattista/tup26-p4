import { app } from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, error => {
  if (error) {
    console.error(`No se pudo iniciar en el puerto ${PORT}: ${error.message}`);
    console.error('¿Hay otro servidor corriendo? Cerralo o usá otro puerto (variable PORT).');
    process.exit(1);
  }
  console.log(`MiniCRM escuchando en http://localhost:${PORT}`);
});
