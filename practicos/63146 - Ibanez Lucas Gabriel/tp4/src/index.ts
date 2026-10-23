import { env } from "./config/env.js";
import { motor } from "./config/database.js";
import { app } from "./app.js";

app.listen(env.port, () => {
  console.log(`MiniCRM en http://localhost:${env.port} — base: ${motor}`);
});
