import "dotenv/config";

import { client } from "./db/index.js";
import { crearApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un número entero entre 1 y 65535.");
}

const server = crearApp().listen(port, () => {
  console.info(`MiniCRM API disponible en http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      await client.close();
      process.exit(0);
    });
  });
}
