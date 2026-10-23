import "dotenv/config";
import { app } from "./app.js";

const puerto = Number(process.env.PORT ?? 3000);

app.listen(puerto, "0.0.0.0", () => {
  console.log(`API disponible en http://localhost:${puerto}/api/clientes`);
});
