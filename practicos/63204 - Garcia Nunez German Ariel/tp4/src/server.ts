// Importamos el módulo path nativo de Node para manejar rutas de archivos
import path from "node:path";

// Importamos fileURLToPath para obtener la ruta absoluta del archivo en módulos ESM
import { fileURLToPath } from "node:url";

// Importamos el framework Express
import express from "express";

// Importamos la función de inicialización de la base de datos SQLite
import { initDb } from "./db/index.js";

// Importamos los enrutadores de clientes y actividades
import actividadesRouter from "./routes/actividades.routes.js";
import clientesRouter from "./routes/clientes.routes.js";

// Obtenemos la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creamos la aplicación Express
const app = express();

// Definimos el puerto del servidor (3000 por defecto o el asignado por el entorno)
const PORT = process.env.PORT || 3000;

// Middleware para interpretar solicitudes con cuerpo en formato JSON
app.use(express.json());

// Obtenemos la ruta absoluta de la carpeta pública de archivos estáticos
const carpetaPublica = path.join(__dirname, "..", "public");

// Servimos todos los archivos dentro de 'public' (HTML, CSS, imágenes, etc.)
app.use(express.static(carpetaPublica));

// Montamos las rutas de clientes en el prefijo /api/clientes
app.use("/api/clientes", clientesRouter);

// Montamos las rutas de actividades en el prefijo /api
app.use("/api", actividadesRouter);

// Redirigimos la raíz "/" para que entregue directamente la interfaz MiniCRM.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(carpetaPublica, "MiniCRM.html"));
});

// Función de arranque asíncrona del servidor
async function arrancarServidor() {
  try {
    // Inicializamos la base de datos y creamos tablas si no existen
    await initDb();

    // Iniciamos la escucha de peticiones en el puerto especificado
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` Servidor MiniCRM iniciado correctamente en el puerto ${PORT}`);
      console.log(` Abrir en el navegador: http://localhost:${PORT}/MiniCRM.html`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    // Si ocurre un error al conectar la base de datos, lo mostramos y cerramos el proceso
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Ejecutamos el arranque del servidor
arrancarServidor();
