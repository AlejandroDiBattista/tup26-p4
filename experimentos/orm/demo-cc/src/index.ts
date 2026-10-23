import { createApp } from "./app.js";
import { Clientes } from "./clientes/clientes.js";
import { config } from "./config.js";
import { createDb } from "./db/client.js";

Clientes.conectar(createDb(config.databaseUrl, config.authToken));

const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, () => console.log(`API en http://localhost:${port}/api/clientes`));
