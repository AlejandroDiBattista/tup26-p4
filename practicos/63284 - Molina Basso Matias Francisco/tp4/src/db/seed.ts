import { client } from "./index.js";
import { sembrarDemo } from "./seed-demo.js";

try {
  await sembrarDemo();
  console.log(
    "Carga demo aplicada: 10 clientes con 4 actividades cada uno, sin duplicar registros existentes.",
  );
} finally {
  client.close();
}
