import { app } from './app';
import { sembrarDatos } from './db/seed';

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    // Si la base de datos está vacía, sembramos datos iniciales para la demo
    await sembrarDatos();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` MiniCRM Servidor ejecutándose exitosamente!`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Interfaz: http://localhost:${PORT}/MiniCRM.html`);
      console.log(` API REST: http://localhost:${PORT}/api/clientes`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
