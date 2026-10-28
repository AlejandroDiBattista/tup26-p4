import { crearApp } from "./app.js";
import { client } from "./db/conexion.js";
import { migrar } from "./db/migrar.js";
import { sembrar } from "./db/semilla.js";

await migrar();
await sembrar();

const port = Number(process.env.PORT ?? 3000);
const server = crearApp().listen(port, () => {
  console.log(`MiniCRM en http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      await client.close();
      process.exit(0);
    });
  });
}
