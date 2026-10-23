import "dotenv/config";
import { app } from "./app";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`MiniCRM escuchando en http://localhost:${PORT}`);
  console.log(`  Interfaz: http://localhost:${PORT}/MiniCRM.html`);
  console.log(`  API:      http://localhost:${PORT}/api/clientes`);
});
